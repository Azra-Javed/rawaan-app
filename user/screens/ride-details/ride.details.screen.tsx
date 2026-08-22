import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker, Polyline, UrlTile, Region } from "react-native-maps";

import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import { getRoute, type Coord } from "@/utils/osrm";

type RideData = {
  user?: any;
  currentLocation?: Coord; // pickup, matches your driver's rideData.currentLocation
  dropoff?: Coord; // matches your driver's rideData.dropoff
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

  // currentLocation = pickup, dropoff = destination -- matches your driver's acceptRideHandler shape
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

  // Real road route via your OSRM utility -- not Google Directions, matching your existing stack
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
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: fontSizes.FONT18, marginBottom: 15 }}>
          Ride information could not be loaded.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text
            style={{
              color: color.buttonBg,
              fontSize: fontSizes.FONT16,
              fontWeight: "600",
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: windowHeight(450) }}>
        <MapView
          style={{ width: "100%", height: "100%" }}
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

        <View
          style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            backgroundColor: "rgba(255,255,255,0.85)",
            paddingHorizontal: 5,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 9 }}>
            © MapTiler © OpenStreetMap contributors
          </Text>
        </View>

        {routeLoading && (
          <View
            style={{
              position: "absolute",
              top: 15,
              alignSelf: "center",
              backgroundColor: "white",
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="small" />
            <Text style={{ marginLeft: 8, fontSize: fontSizes.FONT12 }}>
              Loading route...
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: windowWidth(20),
          paddingTop: windowHeight(15),
        }}
      >
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "600",
            paddingVertical: windowHeight(5),
          }}
        >
          Ride Details
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT18,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Driver: {driver?.name || "Driver"}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: fontSizes.FONT16, fontWeight: "500" }}>
            Phone:
          </Text>
          <TouchableOpacity
            disabled={!driver?.phone_number}
            onPress={callDriver}
          >
            <Text
              style={{
                color: color.buttonBg,
                paddingLeft: 8,
                fontSize: fontSizes.FONT16,
                fontWeight: "500",
              }}
            >
              {driver?.phone_number || "Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: fontSizes.FONT16,
            fontWeight: "500",
            paddingVertical: windowHeight(7),
          }}
        >
          Vehicle: {driver?.vehicle_type || "N/A"}
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT16,
            fontWeight: "500",
            paddingVertical: windowHeight(3),
          }}
        >
          Color: {driver?.vehicle_color || "N/A"}
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT16,
            fontWeight: "500",
            paddingVertical: windowHeight(7),
          }}
        >
          Distance: {distance.toFixed(2)} km
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT18,
            fontWeight: "600",
            paddingVertical: windowHeight(5),
          }}
        >
          Payable Amount: {payableAmount.toFixed(2)} PKR
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT14,
            fontWeight: "400",
            paddingVertical: windowHeight(8),
          }}
        >
          Pay your driver after reaching your destination.
        </Text>
      </View>
    </View>
  );
};

export default RideDetailsScreen;
