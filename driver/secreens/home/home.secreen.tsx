import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/common/header";
import { external } from "@/styles/external.style";
import styles from "./styles";
import { recentRidesData, rideData } from "@/configs/constants";
import RenderRideItem from "@/components/ride/render-ride-item";
import { useTheme } from "@react-navigation/native";
import RideCard from "@/components/ride/ride.card";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/button";
import { Gps, Location as LocationIcon } from "@/utils/icons";
import color from "@/themes/app.colors";
import type { Coord } from "@/utils/osrm";
import { getRoute } from "@/utils/osrm";
import type { PlaceResult } from "@/utils/nominatim";
import { router } from "expo-router";

import * as Location from "expo-location";
import api from "@/api/client";
import { getItem, setItem } from "@/utils/authStorage";
import { Toast } from "react-native-toast-notifications";
import { useDriver } from "@/hooks/useDriver";

import {
  connectWebSocket,
  sendWebSocketMessage,
  disconnectWebSocket,
} from "@/utils/websocket";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// Set up how notifications behave when they arrive -- runs once at module load, not on every render
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Only send a location update once the driver has moved at least this far -- keeps WebSocket traffic low
const MIN_DISTANCE_METERS = 200;

const HomeScreen = () => {
  const { colors } = useTheme();
  const { driver } = useDriver();
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );

  // Map region shown in the "incoming ride" modal
  const [region, setRegion] = useState<any>({
    latitude: 31.5497,
    longitude: 74.3436,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Driver's live GPS position
  const [currentLocation, setCurrentLocation] = useState<Coord | null>(null);

  // Pickup/dropoff for whichever ride request is currently showing in the modal.
  // pickup = where the rider currently is, dropoff = where they're going.
  const [pickup, setPickup] = useState<Coord | null>(null);
  const [dropoff, setDropoff] = useState<Coord | null>(null);

  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);

  // Online/offline toggle state
  const [isOn, setIsOn] = useState<boolean>(false);
  const [loading, setloading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Whether the WebSocket connection is currently open -- used to gate location broadcasts
  const [wsConnected, setWsConnected] = useState(false);

  // Last position we actually broadcast -- used to check how far the driver has moved since then
  const lastLocationRef = useRef<Coord | null>(null);

  // Human-readable ride details shown in the modal
  const [currentLocationName, setCurrentLocationName] = useState("");
  const [destinationLocationName, setDestinationLocationName] = useState("");

  // BUG D fix: distance is stored/typed as a real number, not whatever type the
  // rider app happened to send (it sends a string via .toFixed()).
  const [distance, setDistance] = useState<number | null>(null);

  const [userData, setUserData] = useState<any>(null);

  const [recentRides, setrecentRides] = useState([]);

  // Connect to the WebSocket once when the screen mounts, and mark connection state
  useEffect(() => {
    connectWebSocket(
      (data) => {
        console.log("WebSocket data:", data);

        if (data.type === "rideRequest") {
          console.log("New ride request:", data);

          if (data.pickup) {
            setPickup(data.pickup);
          }

          if (data.dropoff) {
            setDropoff(data.dropoff);
          }

          setIsModalVisible(true);
        }
      },
      () => {
        setWsConnected(true);
      },
    );

    return () => {
      setWsConnected(false);
      disconnectWebSocket();
    };
  }, []);

  // Restore the driver's last known online/offline status from secure storage on app start
  useEffect(() => {
    const getStatus = async () => {
      try {
        const status = await getItem("status");
        setIsOn(status === "active");
      } catch (error) {
        console.log("Status error:", error);
      }
    };

    getStatus();
  }, []);

  // Calculates the straight-line distance in meters between two coordinates (haversine formula)
  const haversineDistance = (coords1: Coord, coords2: Coord) => {
    const toRad = (x: number) => (x * Math.PI) / 180;

    const R = 6371e3; // Earth's radius in meters
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
    const deltaLat = toRad(coords2.latitude - coords1.latitude);
    const deltaLon = toRad(coords2.longitude - coords1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  };

  // Track the driver's live GPS position and broadcast it while online
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Toast.show(
            "Please give access to your location to use this application",
            { type: "danger" },
          );
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 10,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            const current = { latitude, longitude };

            // Always keep the map and pickup marker in sync with the driver's real position.
            // NOTE: this only affects the driver's OWN live location dot -- it does not
            // touch the ride-request pickup/dropoff, which come from the notification listener.
            setCurrentLocation(current);

            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });

            // Only broadcast to the server if online, identified, and connected
            if (isOn && driver?.id && wsConnected) {
              const movedFarEnough =
                !lastLocationRef.current ||
                haversineDistance(lastLocationRef.current, current) >
                  MIN_DISTANCE_METERS;

              if (movedFarEnough) {
                sendLocationUpdate(current);
                lastLocationRef.current = current;
              }
            }
          },
        );
      } catch (error) {
        console.log("Location tracking error:", error);
      }
    };

    startLocationTracking();

    return () => {
      subscription?.remove();
    };
  }, [isOn, driver?.id, wsConnected]);

  // Send the driver's current location to the WebSocket server
  const sendLocationUpdate = (location: Coord) => {
    if (!driver?.id) {
      console.log("Driver ID is missing");
      return;
    }

    sendWebSocketMessage({
      type: "locationUpdate",
      role: "driver",
      driverId: driver.id,
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });

    console.log("Driver location sent:", location);
  };

  // Toggle online/offline status, persist it, and sync with the backend
  const handleStatusChange = async () => {
    try {
      setloading(true);

      const newStatus = isOn ? "inactive" : "active";

      const changeStatus = await api.put(`/driver/update-status`, {
        status: newStatus,
      });

      const status = changeStatus.data?.driver?.status;

      if (status) {
        await setItem("status", status.toString());
        setIsOn(status === "active");
      } else {
        Toast.show("Could not update status", { type: "danger" });
      }
    } catch (error) {
      console.log("Status change error:", error);
      Toast.show("Failed to update status. Check your connection.", {
        type: "danger",
      });
    } finally {
      setloading(false);
    }
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  // Send a push notification to any Expo push token (rider or driver)
  const sendPushNotification = async (expoPushToken: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Ride Request Accepted!",
      body: "Your driver is on the way!",
      data: { orderData: JSON.stringify(data) },
    };
    await api
      .post("https://exp.host/--/api/v2/push/send", message)
      .then((res) => console.log(res.data))
      .catch((error) => console.log(error));
  };

  // BUG C fix: accepting a ride now actually persists it, notifies the rider,
  // closes the modal, and navigates to a ride-in-progress screen.
  const acceptRideHandler = async () => {
    if (!dropoff || !pickup) {
      console.log("Missing pickup or dropoff, cannot accept ride");
      return;
    }

    try {
      const response = await api.post("/driver/new-ride", {
        userId: userData?.id,
        charge:
          distance !== null && driver?.rate
            ? (distance * parseFloat(driver.rate)).toFixed(2)
            : "0.00",
        status: "Processing",
        currentLocationName,
        destinationLocationName,
        distance,
      });

      const rideData = {
        user: userData,
        currentLocation: pickup,
        dropoff,
        driver,
        distance,
        ride: response.data?.newRide,
      };

      console.log("Ride accepted:", rideData);

      // Notify the rider that their ride was accepted, using the rider's own push token
      if (userData?.pushToken) {
        await sendPushNotification(userData.pushToken, rideData);
      } else {
        console.log("Rider has no push token, skipping notification");
      }

      setIsModalVisible(false);

      router.push({
        pathname: "/(routes)/ride-details",
        params: { orderData: JSON.stringify(rideData) },
      });
    } catch (error) {
      console.log("Accept ride error:", error);
      Toast.show("Failed to accept ride. Please try again.", {
        type: "danger",
      });
    }
  };

  // Listen for incoming push notifications about new ride requests
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        try {
          const orderData = JSON.parse(
            notification?.request?.content?.data?.orderData as string,
          );

          console.log("Ride notification data:", orderData);

          setIsModalVisible(true);

          //  currentLocation (the rider's live position) maps to pickup,
          // and marker (the rider's chosen destination) maps to dropoff -- not the other way around.
          setPickup({
            latitude: orderData.currentLocation.latitude,
            longitude: orderData.currentLocation.longitude,
          });

          setDropoff({
            latitude: orderData.marker.latitude,
            longitude: orderData.marker.longitude,
          });

          const latDiff = Math.abs(
            orderData.currentLocation.latitude - orderData.marker.latitude,
          );
          const lngDiff = Math.abs(
            orderData.currentLocation.longitude - orderData.marker.longitude,
          );

          setRegion({
            latitude:
              (orderData.currentLocation.latitude + orderData.marker.latitude) /
              2,
            longitude:
              (orderData.currentLocation.longitude +
                orderData.marker.longitude) /
              2,
            latitudeDelta: latDiff > 0.005 ? latDiff * 1.5 : 0.01,
            longitudeDelta: lngDiff > 0.005 ? lngDiff * 1.5 : 0.01,
          });

          // BUG D fix: coerce whatever the rider app sent into a real number
          setDistance(
            orderData.distance !== undefined && orderData.distance !== null
              ? Number(orderData.distance)
              : null,
          );

          setCurrentLocationName(orderData.currentLocationName);
          setDestinationLocationName(orderData.destinationLocation);
          setUserData(orderData.user);
        } catch (error) {
          console.log("Failed to process ride notification:", error);
        }
      });

    return () => {
      notificationListener.current?.remove();
      notificationListener.current = null;
    };
  }, []);

  // BUG B fix: fetch the actual route between pickup and dropoff whenever both are known,
  // so the modal's Polyline has something real to draw instead of staying empty.
  useEffect(() => {
    if (pickup && dropoff) {
      getRoute(pickup, dropoff).then((result) => {
        if (result) {
          setRouteCoords(result.coords);
        }
      });
    } else {
      setRouteCoords([]);
    }
  }, [pickup, dropoff]);

  // Ask for push notification permission and register this device for ride-request pushes
  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Toast.show("Failed to get push token for push notification!", {
          type: "danger",
        });
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        Toast.show("Failed to get project id for push notification!", {
          type: "danger",
        });
        return;
      }

      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({ projectId })
        ).data;
        console.log(pushTokenString);

        await api.put("/driver/update-push-token", {
          pushToken: pushTokenString,
        });
        console.log("Push token saved to backend");
      } catch (e: unknown) {
        Toast.show(`${e}`, { type: "danger" });
      }
    } else {
      Toast.show("Must use physical device for Push Notifications", {
        type: "danger",
      });
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <View style={[external.fx_1]}>
      <View style={styles.spaceBelow}>
        <Header isOn={isOn} toggleSwitch={() => handleStatusChange()} />

        <FlatList
          data={rideData}
          numColumns={2}
          renderItem={({ item }) => (
            <RenderRideItem item={item} colors={colors} />
          )}
        />

        <View style={[styles.rideContainer, { backgroundColor: colors.card }]}>
          <Text
            style={[styles.rideTitle, { color: colors.text }]}
            onPress={() => setIsModalVisible(true)}
          >
            Recent Rides
          </Text>

          <FlatList
            data={recentRidesData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RideCard item={item} />}
          />
        </View>
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleClose}
      >
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1}>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
            <View>
              <Text style={styles.modalTitle}>New Ride Request Received!</Text>
            </View>

            <MapView
              key={isModalVisible ? "map-visible" : "map-hidden"}
              style={{
                width: "100%",
                height: windowHeight(250),
                marginTop: windowHeight(10),
              }}
              region={region}
              onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
              rotateEnabled={true}
              zoomEnabled={true}
              zoomControlEnabled={true}
              showsCompass={true}
              pitchEnabled={true}
              scrollEnabled={true}
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
                alignItems: "flex-end",
                marginTop: -windowHeight(16),
                marginBottom: windowHeight(6),
              }}
            >
              <Text style={{ fontSize: 9 }}>
                © MapTiler © OpenStreetMap contributors
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View style={styles.leftView}>
                <LocationIcon color={colors.text} />

                <View
                  style={[styles.verticaldot, { borderColor: color.buttonBg }]}
                />

                <Gps colors={colors.text} />
              </View>

              <View style={styles.rightView}>
                <Text style={[styles.pickup, { color: colors.text }]}>
                  {currentLocationName || "Pickup location"}
                </Text>

                <View style={styles.border} />

                <Text style={[styles.drop, { color: colors.text }]}>
                  {destinationLocationName || "Dropoff location"}
                </Text>
              </View>
            </View>

            <Text
              style={{
                paddingTop: windowHeight(5),
                fontSize: windowHeight(14),
              }}
            >
              Distance: {distance !== null ? `${distance} km` : "--"}
            </Text>

            <Text
              style={{
                paddingVertical: windowHeight(5),
                fontSize: windowHeight(14),
              }}
            >
              Amount:{" "}
              {distance !== null && driver?.rate
                ? (distance * parseFloat(driver.rate)).toFixed(2)
                : "0.00"}{" "}
              BDT
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: windowHeight(5),
              }}
            >
              <Button
                title="Decline"
                onPress={handleClose}
                width={windowWidth(120)}
                height={windowHeight(30)}
                backgroundColor="crimson"
              />

              <Button
                title="Accept"
                onPress={acceptRideHandler}
                width={windowWidth(120)}
                height={windowHeight(30)}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeScreen;
