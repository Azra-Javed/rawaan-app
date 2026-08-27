import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, Region, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import color from "@/themes/app.colors";
import { getRoute, type Coord } from "@/utils/osrm";
import styles from "./styles";

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
      <SafeAreaView style={styles.emptyScreen}>
        <View style={styles.emptyLoadingIcon}>
          <Ionicons name="car-outline" size={30} color={color.nightIndigo} />
        </View>

        <Text style={styles.emptyScreenTitle}>
          Ride information could not be loaded.
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonEmpty}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* =====================================================
          MAP
      ===================================================== */}

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
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
          style={styles.mapBackButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={21} color={color.nightIndigo} />
        </TouchableOpacity>

        {/* MAP LABEL */}

        <View style={styles.mapLabel}>
          <Ionicons
            name="navigate-outline"
            size={14}
            color={color.nightIndigo}
          />

          <Text style={styles.mapLabelText}>Your route</Text>
        </View>

        {/* MAPTILER ATTRIBUTION */}

        <View style={styles.attribution}>
          <Text style={styles.attributionText}>
            © MapTiler © OpenStreetMap contributors
          </Text>
        </View>

        {/* ROUTE LOADING */}

        {routeLoading && (
          <View style={styles.routeLoading}>
            <ActivityIndicator size="small" color={color.nightIndigo} />

            <Text style={styles.routeLoadingText}>Loading route...</Text>
          </View>
        )}
      </View>

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <SafeAreaView edges={["bottom"]} style={styles.detailsContainer}>
        <View style={styles.detailsContent}>
          {/* HEADER */}

          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.eyebrow}>RAWAAN</Text>

              <Text style={styles.title}>Ride Details</Text>
            </View>

            <View style={styles.rideIcon}>
              <Ionicons
                name="car-outline"
                size={21}
                color={color.nightIndigo}
              />
            </View>
          </View>

          {/* DRIVER CARD */}

          <View style={styles.driverCard}>
            <View style={styles.driverIcon}>
              <Ionicons
                name="person-outline"
                size={22}
                color={color.nightIndigo}
              />
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.smallLabel}>DRIVER</Text>

              <Text style={styles.driverName}>{driver?.name || "Driver"}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.callButton,
                !driver?.phone_number && styles.callButtonDisabled,
              ]}
              disabled={!driver?.phone_number}
              onPress={callDriver}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call-outline"
                size={19}
                color={driver?.phone_number ? color.white : color.muted}
              />
            </TouchableOpacity>
          </View>

          {/* RIDE INFORMATION */}

          <View style={styles.infoCard}>
            {/* PHONE */}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="call-outline"
                  size={17}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>PHONE</Text>

                <Text
                  style={[
                    styles.infoValue,
                    driver?.phone_number && styles.phoneValue,
                  ]}
                >
                  {driver?.phone_number || "Unavailable"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* VEHICLE */}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="car-outline"
                  size={17}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>VEHICLE</Text>

                <Text style={styles.infoValue}>
                  {driver?.vehicle_type || "N/A"}
                </Text>
              </View>

              <View style={styles.vehicleColorContainer}>
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor:
                        driver?.vehicle_color?.toLowerCase() || "#AAB5B5",
                    },
                  ]}
                />

                <Text style={styles.vehicleColorText}>
                  {driver?.vehicle_color || "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* DISTANCE */}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>DISTANCE</Text>

                <Text style={styles.infoValue}>{distance.toFixed(2)} km</Text>
              </View>
            </View>
          </View>

          {/* PAYMENT */}

          <View style={styles.paymentCard}>
            <View>
              <Text style={styles.paymentLabel}>PAYABLE AMOUNT</Text>

              <Text style={styles.paymentHint}>
                Pay your driver after reaching your destination.
              </Text>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amount}>{payableAmount.toFixed(2)}</Text>

              <Text style={styles.currency}>PKR</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default RideDetailsScreen;
