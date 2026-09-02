import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Linking,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker, Polyline, UrlTile, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import Button from "@/components/common/button";
import api from "@/api/client";
import { Toast } from "react-native-toast-notifications";
import { getRoute, type Coord } from "@/utils/osrm";

type RideData = {
  user?: {
    id?: string;
    name?: string;
    phone_number?: string;
  };
  currentLocation?: Coord; // pickup
  dropoff?: Coord;
  driver?: {
    name?: string;
    rate?: string | number;
  };
  distance?: number | string;
  ride?: {
    id?: string;
    status?: string;
    destinationName?: string;
  };
};

const DEFAULT_REGION: Region = {
  latitude: 31.5497,
  longitude: 74.3436,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function RideDetailsScreen() {
  const params = useLocalSearchParams();
  const orderDataParam = params.orderData;

  const [orderData, setOrderData] = useState<RideData | null>(null);
  const [orderStatus, setOrderStatus] = useState("Processing");
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Parse the ride data passed in via navigation params
  useEffect(() => {
    try {
      if (!orderDataParam) {
        console.log("No orderData received");
        return;
      }

      const parsed =
        typeof orderDataParam === "string"
          ? JSON.parse(orderDataParam)
          : orderDataParam;

      setOrderData(parsed);
      setOrderStatus(parsed?.ride?.status || "Processing");
    } catch (error) {
      console.log("Failed to parse ride data:", error);
    }
  }, [orderDataParam]);

  const pickup = useMemo<Coord | null>(() => {
    if (
      orderData?.currentLocation?.latitude !== undefined &&
      orderData?.currentLocation?.longitude !== undefined
    ) {
      return {
        latitude: Number(orderData.currentLocation.latitude),
        longitude: Number(orderData.currentLocation.longitude),
      };
    }
    return null;
  }, [orderData]);

  const dropoff = useMemo<Coord | null>(() => {
    if (
      orderData?.dropoff?.latitude !== undefined &&
      orderData?.dropoff?.longitude !== undefined
    ) {
      return {
        latitude: Number(orderData.dropoff.latitude),
        longitude: Number(orderData.dropoff.longitude),
      };
    }
    return null;
  }, [orderData]);

  // Fit the map to show both pickup and dropoff
  useEffect(() => {
    if (!pickup || !dropoff) return;

    const latitude = (pickup.latitude + dropoff.latitude) / 2;
    const longitude = (pickup.longitude + dropoff.longitude) / 2;
    const latitudeDelta = Math.abs(pickup.latitude - dropoff.latitude) * 2;
    const longitudeDelta = Math.abs(pickup.longitude - dropoff.longitude) * 2;

    setRegion({
      latitude,
      longitude,
      latitudeDelta: Math.max(latitudeDelta, 0.02),
      longitudeDelta: Math.max(longitudeDelta, 0.02),
    });
  }, [pickup, dropoff]);

 
  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      if (!pickup || !dropoff) {
        setRouteCoords([]);
        return;
      }

      try {
        const result = await getRoute(pickup, dropoff);
        if (cancelled) return;
        setRouteCoords(result?.coords?.length ? result.coords : []);
      } catch (error) {
        console.log("Ride route error:", error);
        if (!cancelled) setRouteCoords([]);
      }
    };

    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [pickup, dropoff]);

  const distance = Number(orderData?.distance ?? 0);
  const driver = orderData?.driver;
  const user = orderData?.user;

  const payableAmount =
    driver?.rate !== undefined ? distance * Number(driver.rate) : 0;

  const callPassenger = async () => {
    if (!user?.phone_number) {
      console.log("Passenger phone number unavailable");
      return;
    }
    try {
      await Linking.openURL(`tel:${user.phone_number}`);
    } catch (error) {
      console.log("Unable to open phone dialer:", error);
    }
  };

  // Advance the ride: Processing -> Ongoing -> Completed
  const handleSubmit = async () => {
    if (!orderData?.ride?.id) {
      Toast.show("Ride information is missing, cannot update status", {
        type: "danger",
      });
      return;
    }

    const nextStatus = orderStatus === "Ongoing" ? "Completed" : "Ongoing";

    try {
      setSubmitting(true);

      const res = await api.put(`/driver/update-ride-status`, {
        rideStatus: nextStatus,
        rideId: orderData.ride.id,
      });

      const updatedStatus = res.data?.updatedRide?.status;

      if (updatedStatus === "Ongoing") {
        setOrderStatus(updatedStatus);
        Toast.show("Let's have a safe journey!", { type: "success" });
      } else if (updatedStatus === "Completed") {
        Toast.show(`Well done ${driver?.name || "driver"}!`, {
          type: "success",
        });
        router.push("/(tabs)/home");
      }
    } catch (error) {
      console.log("Update ride status error:", error);
      Toast.show("Failed to update ride status. Please try again.", {
        type: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderData) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="car-outline"
            size={30}
            color={color.tealDark}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Ride information could not be loaded.
        </Text>

        <Text style={styles.emptySubtitle}>
          Please go back and try again.
        </Text>

        <Pressable
          style={styles.emptyButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={color.white}
          />

          <Text style={styles.emptyButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  console.log("RideDetailsScreen render, orderData:", orderData);
  console.log(user, pickup, dropoff, distance, payableAmount);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={color.tealDark}
      />

      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          rotateEnabled
          zoomEnabled
          zoomControlEnabled
          showsCompass
          pitchEnabled
          scrollEnabled
        >
          <UrlTile
            urlTemplate={`https://api.maptiler.com/maps/positron-v4/256/{z}/{x}/{y}.png?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
            maximumZ={20}
          />

          {pickup && (
            <Marker
              coordinate={pickup}
              title="Pickup"
            />
          )}

          {dropoff && (
            <Marker
              coordinate={dropoff}
              title="Dropoff"
              pinColor={color.coral}
            />
          )}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor={color.teal}
            />
          )}
        </MapView>

        {/* MAP TOP OVERLAY */}
        <View style={styles.mapTopOverlay}>
          <Pressable
            style={styles.mapBackButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={color.tealDark}
            />
          </Pressable>

        

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              {orderStatus}
            </Text>
          </View>
        </View>

        {/* MAP ATTRIBUTION */}
        <View style={styles.mapAttribution}>
          <Text style={styles.mapAttributionText}>
            © MapTiler © OpenStreetMap contributors
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.bottomSheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HANDLE */}
          <View style={styles.sheetHandle} />

          {/* HEADER */}
          <View style={styles.rideHeader}>
            <View>
              <Text style={styles.eyebrow}>
                {orderStatus === "Processing"
                  ? "PASSENGER PICKUP"
                  : "RIDE IN PROGRESS"}
              </Text>

              <Text style={styles.title}>
                {orderStatus === "Processing"
                  ? "Pick up your passenger"
                  : "Continue the journey"}
              </Text>
            </View>

            <View style={styles.rideHeaderIcon}>
              <Ionicons
                name={
                  orderStatus === "Processing"
                    ? "person-outline"
                    : "car-outline"
                }
                size={21}
                color={color.tealDark}
              />
            </View>
          </View>

          {/* PASSENGER CARD */}
          <View style={styles.passengerCard}>
            <View style={styles.passengerAvatar}>
              <Ionicons
                name="person"
                size={23}
                color={color.tealDark}
              />
            </View>

            <View style={styles.passengerInfo}>
              <Text style={styles.cardLabel}>
                PASSENGER
              </Text>

              <Text style={styles.passengerName}>
                {user?.name || "Passenger"}
              </Text>

              <Text style={styles.passengerRide}>
                Your current ride passenger
              </Text>
            </View>

            <Pressable
              style={styles.callButton}
              onPress={callPassenger}
            >
              <Ionicons
                name="call"
                size={19}
                color={color.white}
              />
            </Pressable>
          </View>

      

         

          {/* RIDE STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color={color.tealDark}
                />
              </View>

              <Text style={styles.statLabel}>
                DISTANCE
              </Text>

              <Text style={styles.statValue}>
                {distance.toFixed(2)} km
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconAmber}>
                <Ionicons
                  name="cash-outline"
                  size={17}
                  color={color.amber}
                />
              </View>

              <Text style={styles.statLabel}>
                EARNINGS
              </Text>

              <Text style={styles.statValue}>
                {payableAmount.toFixed(2)} PKR
              </Text>
            </View>
          </View>

          {/* STATUS */}
          <View style={styles.statusCard}>
            <View style={styles.statusCardIcon}>
              <Ionicons
                name={
                  orderStatus === "Processing"
                    ? "location-outline"
                    : "checkmark-circle-outline"
                }
                size={19}
                color={color.tealDark}
              />
            </View>

            <View style={styles.statusCardContent}>
              <Text style={styles.statusCardTitle}>
                {orderStatus === "Processing"
                  ? "Passenger is waiting"
                  : "Ride is ongoing"}
              </Text>

              <Text style={styles.statusCardSubtitle}>
                {orderStatus === "Processing"
                  ? "Navigate to the pickup location and collect the passenger."
                  : "Drive safely and complete the passenger's journey."}
              </Text>
            </View>
          </View>

          {/* ACTION */}
          <View style={styles.actionSection}>
            <Button
              title={
                submitting
                  ? "Please wait..."
                  : orderStatus === "Processing"
                    ? "Pick Up Passenger"
                    : "Drop Off Passenger"
              }
              height={windowHeight(46)}
              disabled={submitting}
              backgroundColor={color.tealDark}
              onPress={handleSubmit}
            />

            <View style={styles.safeJourney}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color={color.teal}
              />

              <Text style={styles.safeJourneyText}>
                Drive safely • Passenger details are secure
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  mapContainer: {
    height: windowHeight(330),
    position: "relative",
    overflow: "hidden",
    backgroundColor: color.tealDark,
  },

  map: {
    flex: 1,
  },

  mapTopOverlay: {
    position: "absolute",
    top: windowHeight(35),
    left: windowWidth(16),
    right: windowWidth(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  mapBackButton: {
    width: windowWidth(42),
    height: windowWidth(42),
    borderRadius: windowWidth(21),
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  mapTitleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: windowWidth(14),
    paddingHorizontal: windowWidth(11),
    paddingVertical: windowHeight(8),
    marginHorizontal: windowWidth(8),
    flex: 1,
    maxWidth: windowWidth(165),
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  mapTitleIcon: {
    width: windowWidth(31),
    height: windowWidth(31),
    borderRadius: windowWidth(10),
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(8),
  },

  mapEyebrow: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: color.textMuted,
  },

  mapTitle: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: "700",
    color: color.textDark,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: windowWidth(10),
    paddingVertical: windowHeight(8),
    borderRadius: windowWidth(14),
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.green,
    marginRight: 6,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: color.textDark,
    textTransform: "capitalize",
  },

  mapAttribution: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.86)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },

  mapAttributionText: {
    fontSize: 8,
    color: color.textMuted,
  },

  bottomSheet: {
    flex: 1,
    marginTop: -6,
    backgroundColor: color.ivory,
    borderTopLeftRadius: windowWidth(24),
    borderTopRightRadius: windowWidth(24),
    overflow: "hidden",
  },

  content: {
    paddingHorizontal: windowWidth(18),
    paddingTop: windowHeight(8),
    paddingBottom: windowHeight(30),
  },

  sheetHandle: {
    width: windowWidth(42),
    height: 4,
    borderRadius: 3,
    backgroundColor: color.border,
    alignSelf: "center",
    marginBottom: windowHeight(6),
  },

  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: windowHeight(10)
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.3,
    color: color.teal,
    marginBottom: 4,
  },

  title: {
    fontSize: fontSizes.FONT20,
    fontWeight: "700",
    color: color.textDark,
  },

  rideHeaderIcon: {
    width: windowWidth(43),
    height: windowWidth(43),
    borderRadius: windowWidth(14),
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  passengerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    borderRadius: windowWidth(18),
    padding: windowWidth(14),
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: windowHeight(10),
  },

  passengerAvatar: {
    width: windowWidth(48),
    height: windowWidth(48),
    borderRadius: windowWidth(16),
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(11),
  },

  passengerInfo: {
    flex: 1,
  },

  cardLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: color.textMuted,
    marginBottom: 3,
  },

  passengerName: {
    fontSize: fontSizes.FONT16,
    fontWeight: "700",
    color: color.textDark,
  },

  passengerRide: {
    fontSize: 11,
    color: color.textMuted,
    marginTop: 2,
  },

  callButton: {
    width: windowWidth(42),
    height: windowWidth(42),
    borderRadius: windowWidth(14),
    backgroundColor: color.tealDark,
    alignItems: "center",
    justifyContent: "center",
  },

  phoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    borderRadius: windowWidth(16),
    paddingHorizontal: windowWidth(13),
    paddingVertical: windowHeight(12),
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: windowHeight(12),
  },

  phoneIcon: {
    width: windowWidth(36),
    height: windowWidth(36),
    borderRadius: windowWidth(12),
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(10),
  },

  phoneContent: {
    flex: 1,
  },

  phoneNumber: {
    fontSize: fontSizes.FONT14,
    fontWeight: "600",
    color: color.textDark,
  },

  callText: {
    fontSize: 12,
    fontWeight: "700",
    color: color.teal,
    paddingHorizontal: 5,
  },

  routeCard: {
    backgroundColor: color.white,
    borderRadius: windowWidth(18),
    padding: windowWidth(15),
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: windowHeight(12),
  },

  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: windowHeight(15),
  },

  routeTitle: {
    fontSize: fontSizes.FONT15,
    fontWeight: "700",
    color: color.textDark,
  },

  routeIcon: {
    width: windowWidth(35),
    height: windowWidth(35),
    borderRadius: windowWidth(11),
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  routeRow: {
    flexDirection: "row",
  },

  routePointColumn: {
    width: windowWidth(24),
    alignItems: "center",
    paddingTop: 3,
  },

  pickupDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: color.tealDark,
    alignItems: "center",
    justifyContent: "center",
  },

  pickupDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.tealDark,
  },

  routeLine: {
    width: 1.5,
    height: windowHeight(38),
    backgroundColor: color.border,
  },

  dropoffDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: color.coral,
    alignItems: "center",
    justifyContent: "center",
  },

  dropoffDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.coral,
  },

  routeTextColumn: {
    flex: 1,
    paddingLeft: windowWidth(8),
  },

  routeLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: color.textMuted,
  },

  routeValue: {
    fontSize: fontSizes.FONT13,
    fontWeight: "600",
    color: color.textDark,
    marginTop: 3,
  },

  routeSpacing: {
    height: windowHeight(22),
  },

  statsRow: {
    flexDirection: "row",
    gap: windowWidth(10),
    marginBottom: windowHeight(12),
  },

  statCard: {
    flex: 1,
    backgroundColor: color.white,
    borderRadius: windowWidth(16),
    padding: windowWidth(13),
    borderWidth: 1,
    borderColor: color.border,
  },

  statIcon: {
    width: windowWidth(32),
    height: windowWidth(32),
    borderRadius: windowWidth(10),
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: windowHeight(8),
  },

  statIconAmber: {
    width: windowWidth(32),
    height: windowWidth(32),
    borderRadius: windowWidth(10),
    backgroundColor: "#FFF4DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: windowHeight(8),
  },

  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: color.textMuted,
  },

  statValue: {
    fontSize: fontSizes.FONT15,
    fontWeight: "700",
    color: color.textDark,
    marginTop: 4,
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.tealSoft,
    borderRadius: windowWidth(16),
    padding: windowWidth(13),
    marginBottom: windowHeight(15),
  },

  statusCardIcon: {
    width: windowWidth(37),
    height: windowWidth(37),
    borderRadius: windowWidth(12),
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(10),
  },

  statusCardContent: {
    flex: 1,
  },

  statusCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: color.textDark,
  },

  statusCardSubtitle: {
    fontSize: 10.5,
    color: color.textMuted,
    lineHeight: 15,
    marginTop: 2,
  },

  actionSection: {
    marginTop: windowHeight(2),
  },

  safeJourney: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: windowHeight(10),
  },

  safeJourneyText: {
    fontSize: 10,
    color: color.textMuted,
    marginLeft: 5,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: windowWidth(28),
    backgroundColor: color.ivory,
  },

  emptyIcon: {
    width: windowWidth(68),
    height: windowWidth(68),
    borderRadius: windowWidth(23),
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: windowHeight(16),
  },

  emptyTitle: {
    fontSize: fontSizes.FONT18,
    fontWeight: "700",
    color: color.textDark,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 12,
    color: color.textMuted,
    textAlign: "center",
    marginTop: 6,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.tealDark,
    borderRadius: windowWidth(13),
    paddingHorizontal: windowWidth(18),
    paddingVertical: windowHeight(11),
    marginTop: windowHeight(20),
  },

  emptyButtonText: {
    color: color.white,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 7,
  },
});