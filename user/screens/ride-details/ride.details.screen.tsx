import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker, Polyline, UrlTile, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import { getRoute, type Coord } from "@/utils/osrm";

type RideData = {
  user?: any;
  currentLocation?: Coord;
  dropoff?: Coord;
  driver?: {
    id?: string;
    name?: string;
    phone_number?: string;
    vehicle_type?: string;
    vehicle_color?: string;
    rate?: string | number;
  };
  distance?: number | string;
  ride?: any;
};

const palette = {
  nightIndigo: "#0F4C4A",
  nightIndigoLight: "#176B68",
  routeAmber: "#F5A524",
  slateTeal: "#5C6B73",
  ivory: "#FBF8F2",
  ivoryLine: "#0F4C4A14",
  white: "#FFFFFF",
  lightTeal: "#E7F2F1",
  softGray: "#F4F7F7",
  text: "#172525",
  muted: "#899595",
};

const displayFont = "TT-Octosquares-Medium";

const DEFAULT_REGION: Region = {
  latitude: 31.5497,
  longitude: 74.3436,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const RideDetailsScreen = () => {
  const params = useLocalSearchParams();
  const orderDataParam = params.orderData;

  const [orderData, setOrderData] = useState<RideData | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);

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

      console.log("Ride details received:", parsed);
      setOrderData(parsed);
    } catch (error) {
      console.log("Failed to parse ride data:", error);
    }
  }, [orderDataParam]);

  // currentLocation = pickup, dropoff = destination
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

  useEffect(() => {
    if (!pickup || !dropoff) return;

    const latitude = (pickup.latitude + dropoff.latitude) / 2;
    const longitude = (pickup.longitude + dropoff.longitude) / 2;
    const latitudeDifference = Math.abs(pickup.latitude - dropoff.latitude);
    const longitudeDifference = Math.abs(pickup.longitude - dropoff.longitude);

    setRegion({
      latitude,
      longitude,
      latitudeDelta: Math.max(latitudeDifference * 1.5, 0.02),
      longitudeDelta: Math.max(longitudeDifference * 1.5, 0.02),
    });
  }, [pickup, dropoff]);

  // Real road route via your OSRM utility
  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      if (!pickup || !dropoff) {
        setRouteCoords([]);
        return;
      }

      try {
        setRouteLoading(true);

        const result = await getRoute(pickup, dropoff);

        if (cancelled) return;

        setRouteCoords(result?.coords?.length ? result.coords : []);
      } catch (error) {
        console.log("Ride route error:", error);

        if (!cancelled) setRouteCoords([]);
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    };

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [pickup, dropoff]);

  const distance = Number(orderData?.distance ?? 0);
  const driver = orderData?.driver;

  const payableAmount =
    driver?.rate !== undefined ? distance * Number(driver.rate) : 0;

  const callDriver = async () => {
    if (!driver?.phone_number) {
      console.log("Driver phone number unavailable");
      return;
    }

    try {
      await Linking.openURL(`tel:${driver.phone_number}`);
    } catch (error) {
      console.log("Unable to open phone dialer:", error);
    }
  };

  if (!orderData) {
    return (
      <SafeAreaView style={localStyles.emptyScreen}>
        <View style={localStyles.emptyLoadingIcon}>
          <Ionicons name="car-outline" size={30} color={palette.nightIndigo} />
        </View>

        <Text style={localStyles.emptyScreenTitle}>
          Ride information could not be loaded.
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={localStyles.backButtonEmpty}
          activeOpacity={0.8}
        >
          <Text style={localStyles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* =====================================================
          MAP
      ===================================================== */}

      <View style={localStyles.mapContainer}>
        <MapView
          style={localStyles.map}
          region={region}
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
              description="Ride pickup location"
            />
          )}

          {dropoff && (
            <Marker
              coordinate={dropoff}
              title="Dropoff"
              description="Ride destination"
              pinColor="red"
            />
          )}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor={color.buttonBg}
            />
          )}
        </MapView>

        {/* BACK BUTTON */}

        <TouchableOpacity
          style={localStyles.mapBackButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={21} color={palette.nightIndigo} />
        </TouchableOpacity>

        {/* MAP LABEL */}

        <View style={localStyles.mapLabel}>
          <Ionicons
            name="navigate-outline"
            size={14}
            color={palette.nightIndigo}
          />

          <Text style={localStyles.mapLabelText}>Your route</Text>
        </View>

        {/* MAPTILER ATTRIBUTION */}

        <View style={localStyles.attribution}>
          <Text style={localStyles.attributionText}>
            © MapTiler © OpenStreetMap contributors
          </Text>
        </View>

        {/* ROUTE LOADING */}

        {routeLoading && (
          <View style={localStyles.routeLoading}>
            <ActivityIndicator size="small" color={palette.nightIndigo} />

            <Text style={localStyles.routeLoadingText}>Loading route...</Text>
          </View>
        )}
      </View>

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <SafeAreaView edges={["bottom"]} style={localStyles.detailsContainer}>
        <View style={localStyles.detailsContent}>
          {/* HEADER */}

          <View style={localStyles.detailsHeader}>
            <View>
              <Text style={localStyles.eyebrow}>RAWAAN</Text>

              <Text style={localStyles.title}>Ride Details</Text>
            </View>

            <View style={localStyles.rideIcon}>
              <Ionicons
                name="car-outline"
                size={21}
                color={palette.nightIndigo}
              />
            </View>
          </View>

          {/* DRIVER CARD */}

          <View style={localStyles.driverCard}>
            <View style={localStyles.driverIcon}>
              <Ionicons
                name="person-outline"
                size={22}
                color={palette.nightIndigo}
              />
            </View>

            <View style={localStyles.driverInfo}>
              <Text style={localStyles.smallLabel}>DRIVER</Text>

              <Text style={localStyles.driverName}>
                {driver?.name || "Driver"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                localStyles.callButton,
                !driver?.phone_number && localStyles.callButtonDisabled,
              ]}
              disabled={!driver?.phone_number}
              onPress={callDriver}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call-outline"
                size={19}
                color={driver?.phone_number ? palette.white : palette.muted}
              />
            </TouchableOpacity>
          </View>

          {/* RIDE INFORMATION */}

          <View style={localStyles.infoCard}>
            {/* PHONE */}

            <View style={localStyles.infoRow}>
              <View style={localStyles.infoIcon}>
                <Ionicons
                  name="call-outline"
                  size={17}
                  color={palette.nightIndigo}
                />
              </View>

              <View style={localStyles.infoContent}>
                <Text style={localStyles.infoLabel}>PHONE</Text>

                <Text
                  style={[
                    localStyles.infoValue,
                    driver?.phone_number && localStyles.phoneValue,
                  ]}
                >
                  {driver?.phone_number || "Unavailable"}
                </Text>
              </View>
            </View>

            <View style={localStyles.divider} />

            {/* VEHICLE */}

            <View style={localStyles.infoRow}>
              <View style={localStyles.infoIcon}>
                <Ionicons
                  name="car-outline"
                  size={17}
                  color={palette.nightIndigo}
                />
              </View>

              <View style={localStyles.infoContent}>
                <Text style={localStyles.infoLabel}>VEHICLE</Text>

                <Text style={localStyles.infoValue}>
                  {driver?.vehicle_type || "N/A"}
                </Text>
              </View>

              <View style={localStyles.vehicleColorContainer}>
                <View
                  style={[
                    localStyles.colorDot,
                    {
                      backgroundColor:
                        driver?.vehicle_color?.toLowerCase() || "#AAB5B5",
                    },
                  ]}
                />

                <Text style={localStyles.vehicleColorText}>
                  {driver?.vehicle_color || "N/A"}
                </Text>
              </View>
            </View>

            <View style={localStyles.divider} />

            {/* DISTANCE */}

            <View style={localStyles.infoRow}>
              <View style={localStyles.infoIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color={palette.nightIndigo}
                />
              </View>

              <View style={localStyles.infoContent}>
                <Text style={localStyles.infoLabel}>DISTANCE</Text>

                <Text style={localStyles.infoValue}>
                  {distance.toFixed(2)} km
                </Text>
              </View>
            </View>
          </View>

          {/* PAYMENT */}

          <View style={localStyles.paymentCard}>
            <View>
              <Text style={localStyles.paymentLabel}>PAYABLE AMOUNT</Text>

              <Text style={localStyles.paymentHint}>
                Pay your driver after reaching your destination.
              </Text>
            </View>

            <View style={localStyles.amountContainer}>
              <Text style={localStyles.amount}>{payableAmount.toFixed(2)}</Text>

              <Text style={localStyles.currency}>PKR</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default RideDetailsScreen;

/* ============================================================
   STYLES
============================================================ */

const localStyles = StyleSheet.create({
  // ============================================================
  // CONTAINER
  // ============================================================

  container: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ============================================================
  // MAP
  // ============================================================

  mapContainer: {
    height: windowHeight(390),
    position: "relative",
    overflow: "hidden",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapBackButton: {
    position: "absolute",
    top: windowHeight(18),
    left: windowWidth(18),

    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: palette.white,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,

    elevation: 4,
  },

  mapLabel: {
    position: "absolute",

    top: windowHeight(18),
    right: windowWidth(18),

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.white,

    borderRadius: 14,

    paddingHorizontal: 12,
    paddingVertical: 9,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 3,
  },

  mapLabelText: {
    marginLeft: 6,

    fontFamily: "TT-Octosquares-Medium",
    fontSize: 11,

    color: palette.nightIndigo,
  },

  attribution: {
    position: "absolute",

    bottom: 5,
    right: 5,

    backgroundColor: "rgba(255,255,255,0.88)",

    paddingHorizontal: 5,
    paddingVertical: 2,

    borderRadius: 3,
  },

  attributionText: {
    fontSize: 8,
    color: "#596666",
  },

  routeLoading: {
    position: "absolute",

    top: windowHeight(70),
    alignSelf: "center",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.white,

    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 3,
  },

  routeLoadingText: {
    marginLeft: 7,

    fontSize: fontSizes.FONT11,
    color: palette.slateTeal,
  },

  // ============================================================
  // DETAILS
  // ============================================================

  detailsContainer: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  detailsContent: {
    flex: 1,

    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(17),
    paddingBottom: windowHeight(10),
  },

  // ============================================================
  // HEADER
  // ============================================================

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: windowHeight(14),
  },

  eyebrow: {
    fontFamily: displayFont,

    color: palette.routeAmber,

    fontSize: 9,

    letterSpacing: 1.8,

    marginBottom: 3,
  },

  title: {
    fontFamily: displayFont,

    fontSize: 21,

    color: palette.nightIndigo,
  },

  rideIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",
  },

  // ============================================================
  // DRIVER
  // ============================================================

  driverCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: palette.ivoryLine,

    paddingHorizontal: 13,
    paddingVertical: 12,

    marginBottom: windowHeight(10),
  },

  driverIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: palette.lightTeal,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  driverInfo: {
    flex: 1,
  },

  smallLabel: {
    fontFamily: displayFont,

    fontSize: 8,

    letterSpacing: 1.1,

    color: palette.slateTeal,

    marginBottom: 3,
  },

  driverName: {
    fontFamily: displayFont,

    fontSize: 16,

    color: palette.text,
  },

  callButton: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: palette.nightIndigo,

    alignItems: "center",
    justifyContent: "center",
  },

  callButtonDisabled: {
    backgroundColor: "#E8EEEE",
  },

  // ============================================================
  // INFORMATION CARD
  // ============================================================

  infoCard: {
    backgroundColor: palette.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: palette.ivoryLine,

    paddingHorizontal: 13,
    paddingVertical: 4,

    marginBottom: windowHeight(10),
  },

  infoRow: {
    minHeight: 52,

    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: displayFont,

    fontSize: 8,

    letterSpacing: 1,

    color: palette.slateTeal,

    marginBottom: 2,
  },

  infoValue: {
    fontFamily: displayFont,

    fontSize: 13,

    color: palette.text,
  },

  phoneValue: {
    color: palette.nightIndigo,
  },

  divider: {
    height: 1,

    backgroundColor: "#EDF1F1",

    marginLeft: 44,
  },

  vehicleColorContainer: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 10,

    backgroundColor: palette.softGray,
  },

  colorDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    marginRight: 5,
  },

  vehicleColorText: {
    fontFamily: displayFont,

    fontSize: 9,

    color: palette.slateTeal,

    maxWidth: 65,
  },

  // ============================================================
  // PAYMENT
  // ============================================================

  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: palette.nightIndigo,

    borderRadius: 18,

    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  paymentLabel: {
    fontFamily: displayFont,

    fontSize: 9,

    letterSpacing: 1.1,

    color: palette.routeAmber,

    marginBottom: 4,
  },

  paymentHint: {
    fontSize: 10,

    lineHeight: 14,

    color: "#C7D8D6",

    maxWidth: windowWidth(190),
  },

  amountContainer: {
    alignItems: "flex-end",
  },

  amount: {
    fontFamily: displayFont,

    fontSize: 20,

    color: palette.white,
  },

  currency: {
    fontFamily: displayFont,

    fontSize: 9,

    color: palette.routeAmber,

    marginTop: 1,
  },

  // ============================================================
  // EMPTY
  // ============================================================

  emptyScreen: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: palette.ivory,

    paddingHorizontal: windowWidth(25),
  },

  emptyLoadingIcon: {
    width: 64,
    height: 64,

    borderRadius: 20,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 15,
  },

  emptyScreenTitle: {
    fontFamily: displayFont,

    fontSize: fontSizes.FONT16,

    color: palette.nightIndigo,

    textAlign: "center",

    marginBottom: 16,
  },

  backButtonEmpty: {
    backgroundColor: palette.nightIndigo,

    borderRadius: 13,

    paddingHorizontal: 22,
    paddingVertical: 11,
  },

  backButtonText: {
    fontFamily: displayFont,

    fontSize: fontSizes.FONT13,

    color: palette.white,
  },
});
