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
import { Ionicons } from "@expo/vector-icons";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axios from "axios";

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


  const [recentRides, setrecentRides] = useState<any>([]);

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


  const rejectRideHandler = async () => {
    try {

      const response = await api.post("/driver/reject-ride");

      console.log("Ride rejected:", response.data);

      const data = {
        type: "rideRejected",
        driverId: response.data?.driverId,
      };

      // Tell the rider that this driver rejected the request.
      if (userData?.pushToken) {
        try {
          await sendPushNotification(userData.pushToken, data);

          console.log("Rejection notification sent to rider");
        } catch (notificationError: any) {
          console.log(
            "Rejection notification failed:",
            notificationError?.response?.data ||
            notificationError?.message,
          );
        }
      }

      // Close the incoming ride request modal.
      setIsModalVisible(false);

      Toast.show(
        "Ride request rejected.",
        {
          type: "success",
        },
      );
    } catch (error: any) {
      console.log("========== REJECT RIDE ERROR ==========");
      console.log("Error:", error);
      console.log("Response:", error?.response?.data);
      console.log("Status:", error?.response?.status);
      console.log("Message:", error?.message);
      console.log("=======================================");

      Toast.show(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject ride. Please try again.",
        {
          type: "danger",
        },
      );
    }
  };


  // Send a push notification to the rider
  const sendPushNotification = async (
    expoPushToken: string,
    data: any,
  ) => {
    try {
      const isRejected = data?.type === "rideRejected";

      const message = {
        to: expoPushToken,
        sound: "default",

        title: isRejected
          ? "Driver Not Available"
          : "Ride Accepted! 🚗",

        body: isRejected
          ? "This driver is not available."
          : "Your driver has accepted your ride.",

        data: {
          orderData: JSON.stringify(data),
        },
      };

      console.log("========== SENDING PUSH ==========");
      console.log("Token:", expoPushToken);
      console.log("Data:", data);
      console.log("Title:", message.title);
      console.log("Body:", message.body);
      console.log("=================================");

      const response = await axios.post(
        "https://exp.host/--/api/v2/push/send",
        message,
      );

      console.log("Push response:", response.data);

      return response.data;
    } catch (error) {
      console.log("Push notification error:", error);
      throw error;
    }
  };

  const handleClose = () => {
    setIsModalVisible(false);
  }
  // accepting a ride now actually persists it, notifies the rider,
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
        distance: distance !== null ? distance.toFixed(2) : "0.00",
      });


      const data = {
        type: "rideAccepted",
        user: userData,
        currentLocation,
        dropoff,
        distance,
        driver,
        ride: response.data?.newRide,
      };

      console.log("user data in notification", data);

      // Notify the rider that their ride was accepted, using the rider's own push token
      if (userData?.pushToken) {
        try {
          console.log("Sending acceptance notification to:", userData.pushToken);

          await sendPushNotification(userData.pushToken, data);

          console.log("Acceptance push notification sent");
        } catch (notificationError: any) {
          console.log("Push notification failed:", notificationError?.response?.data);
          console.log("But ride was already accepted.");
        }
      } else {
        console.log("Rider has no push token, skipping notification");
      }

      const rideData = {
        user: userData,
        currentLocation: pickup,
        dropoff,
        driver,
        distance,
        ride: response.data?.newRide,
      };

      console.log("Ride accepted:", rideData);

      setIsModalVisible(false);

      router.push({
        pathname: "/(routes)/ride-details",
        params: { orderData: JSON.stringify(rideData) },
      });
    } catch (error: any) {
      console.log("========== ACCEPT RIDE ERROR ==========");
      console.log("Error:", error);
      console.log("Response:", error?.response?.data);
      console.log("Status:", error?.response?.status);
      console.log("Message:", error?.message);
      console.log("=======================================");

      Toast.show(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to accept ride. Please try again.",
        {
          type: "danger",
        }
      );
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

          //  coerce whatever the rider app sent into a real number
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

  //  fetch the actual route between pickup and dropoff whenever both are known,
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

  //get recent rides

  useEffect(() => {
    const getRecentRides = async () => {
      const res = await api.get(`/driver/get-rides`);
      setrecentRides(res.data.rides);
    };

    getRecentRides();
  }, []);

  return (
    <View style={[external.fx_1, { backgroundColor: color.ivory }]}>
      <View style={styles.spaceBelow}>
        {/* Driver header and online status */}
        <View style={styles.headerWrapper}>
          <Header isOn={isOn} toggleSwitch={() => handleStatusChange()} />
        </View>

        {/* Dashboard cards */}
        <View style={styles.dashboardSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Driver dashboard</Text>

              <Text style={styles.sectionSubtitle}>
                Your ride activity at a glance
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Ionicons
                name="speedometer-outline"
                size={19}
                color={color.nightIndigo}
              />
            </View>
          </View>

          <FlatList
            data={rideData}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
              <RenderRideItem item={item} colors={colors} />
            )}
          />
        </View>

        {/* Recent rides */}
        <View style={styles.rideContainer}>
          <View style={styles.rideHeader}>
            <View>
              <Text
                style={styles.rideTitle}

              >
                Recent rides
              </Text>

              <Text style={styles.rideSubtitle}>
                Your latest passenger journeys
              </Text>
            </View>

            <View style={styles.rideIcon}>
              <Ionicons
                name="car-outline"
                size={19}
                color={color.nightIndigo}
              />
            </View>
          </View>

          <FlatList
            data={recentRides}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RideCard item={item} />}
            showsVerticalScrollIndicator={false}
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
            {/* Ride request heading */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons
                  name="car-outline"
                  size={21}
                  color={color.routeAmber}
                />
              </View>

              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>New ride request</Text>

                <Text style={styles.modalSubtitle}>
                  A passenger is waiting for your response
                </Text>
              </View>

              <View style={styles.requestDot} />
            </View>

            {/* Map */}
            <View style={styles.mapWrapper}>
              <MapView
                key={isModalVisible ? "map-visible" : "map-hidden"}
                style={styles.map}
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
                    strokeColor={color.buttonBg}
                  />
                )}
              </MapView>
            </View>

            {/* Map attribution */}
            <View style={styles.mapAttribution}>
              <Text style={styles.attributionText}>
                © MapTiler © OpenStreetMap contributors
              </Text>
            </View>

            {/* Route */}
            <View style={styles.locationContainer}>
              <View style={styles.leftView}>
                <View style={styles.locationIconBox}>
                  <LocationIcon color={color.buttonBg} />
                </View>

                <View
                  style={[
                    styles.verticaldot,
                    { borderColor: color.routeAmber },
                  ]}
                />

                <View style={styles.locationIconBox}>
                  <Gps colors={color.nightIndigo} />
                </View>
              </View>

              <View style={styles.rightView}>
                <Text style={styles.locationLabel} numberOfLines={1}>
                  PICKUP
                </Text>

                <Text style={styles.pickup} numberOfLines={2}>
                  {currentLocationName || "Pickup location"}
                </Text>

                <View style={styles.border} />

                <Text style={styles.locationLabel} numberOfLines={1}>
                  DROPOFF
                </Text>

                <Text style={styles.drop} numberOfLines={2}>
                  {destinationLocationName || "Dropoff location"}
                </Text>
              </View>
            </View>

            {/* Ride information */}
            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons
                    name="navigate-outline"
                    size={17}
                    color={color.buttonBg}
                  />
                </View>

                <View>
                  <Text style={styles.infoLabel}>Distance</Text>

                  <Text style={styles.infoValue}>
                    {distance !== null ? `${distance} km` : "--"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconAmber}>
                  <Ionicons
                    name="cash-outline"
                    size={17}
                    color={color.routeAmber}
                  />
                </View>

                <View>
                  <Text style={styles.infoLabel}>Amount</Text>

                  <Text style={styles.infoValue}>
                    {distance !== null && driver?.rate
                      ? (distance * parseFloat(driver.rate)).toFixed(2)
                      : "0.00"}{" "}
                    BDT
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.buttonContainer}>
              <Button
                title="Decline"
                onPress={rejectRideHandler}
                width={windowWidth(120)}
                height={windowHeight(32)}
                backgroundColor="crimson"
              />

              <Button
                title="Accept"
                onPress={acceptRideHandler}
                width={windowWidth(120)}
                height={windowHeight(32)}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeScreen;
