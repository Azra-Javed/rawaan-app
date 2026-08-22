import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker, Polyline, UrlTile, Region } from "react-native-maps";

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

  // Real road route via OSRM, same pattern used elsewhere in the app
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
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: fontSizes.FONT18 }}>
          Ride information could not be loaded.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: windowHeight(480) }}>
        <MapView
          style={{ flex: 1 }}
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

          {pickup && <Marker coordinate={pickup} title="Pickup" />}
          {dropoff && (
            <Marker coordinate={dropoff} title="Dropoff" pinColor="red" />
          )}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="blue"
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
      </View>

      <View style={{ padding: windowWidth(20) }}>
        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Passenger Name: {user?.name || "Passenger"}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
          >
            Phone Number:
          </Text>

          <Text
            style={{
              color: color.buttonBg,
              paddingLeft: 5,
              fontSize: fontSizes.FONT20,
              fontWeight: "500",
              paddingVertical: windowHeight(5),
            }}
            onPress={callPassenger}
          >
            {user?.phone_number || "Unavailable"}
          </Text>
        </View>

        <Text
          style={{
            fontSize: fontSizes.FONT20,
            fontWeight: "500",
            paddingVertical: windowHeight(5),
          }}
        >
          Payable amount: {payableAmount.toFixed(2)} PKR
        </Text>

        <View style={{ paddingTop: windowHeight(30) }}>
          <Button
            title={
              submitting
                ? "Please wait..."
                : orderStatus === "Processing"
                  ? "Pick Up Passenger"
                  : "Drop Off Passenger"
            }
            height={windowHeight(40)}
            disabled={submitting}
            backgroundColor={color.bgDark}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </View>
  );
}
