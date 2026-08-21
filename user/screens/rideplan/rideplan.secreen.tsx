import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";

import styles from "./styles";
import { useEffect, useRef, useState } from "react";
import { external } from "@/styles/external.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";

import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";

import { router } from "expo-router";

import { Clock, LeftArrow, PickLocation, PickUpLocation } from "@/utils/icons";

import color from "@/themes/app.colors";
import DownArrow from "@/assets/icons/downArrow";
import PlaceHolder from "@/assets/icons/placeHolder";

import * as Location from "expo-location";

import axios from "axios";
import moment from "moment";

import Button from "@/components/common/button";

import { getRoute } from "@/utils/osrm";
import type { Coord } from "@/utils/osrm";
import type { PlaceResult } from "@/utils/nominatim";

import Constants from "expo-constants";
import { useUser } from "@/hooks/useUser";
import PlaceSearchInput from "@/components/location/placeSearchInput";

export default function RidePlanScreen() {
  const { user } = useUser();

  // -----------------------------
  // WebSocket
  // -----------------------------

  const ws = useRef<WebSocket | null>(null);
  const notificationListener = useRef<any>(null);

  const [wsConnected, setWsConnected] = useState(false);

  // -----------------------------
  // Location
  // -----------------------------

  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [currentLocation, setCurrentLocation] = useState<Coord | null>(null);

  // Pickup and destination
  const [pickup, setPickup] = useState<Coord | null>(null);
  const [dropoff, setDropoff] = useState<PlaceResult | null>(null);

  // -----------------------------
  // Route
  // -----------------------------

  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // -----------------------------
  // Ride state
  // -----------------------------

  const [locationSelected, setLocationSelected] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState("Car");

  const [keyboardAvoidingHeight, setKeyboardAvoidingHeight] = useState(false);

  // -----------------------------
  // Drivers
  // -----------------------------

  const [driverLists, setDriverLists] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(undefined);

  const [driverLoader, setDriverLoader] = useState(true);

  // -----------------------------
  // Travel time
  // -----------------------------

  const [travelTime, setTravelTime] = useState<number | null>(null);

  // =========================================================
  // Notifications
  // =========================================================

  // Notifications.setNotificationHandler({
  //   handleNotification: async () => ({
  //     shouldShowAlert: true,
  //     shouldPlaySound: true,
  //     shouldSetBadge: false,
  //   }),
  // });

  // useEffect(() => {
  //   notificationListener.current =
  //     Notifications.addNotificationReceivedListener((notification) => {
  //       const data: any = notification.request.content.data;

  //       const orderData = {
  //         currentLocation: data.currentLocation,
  //         marker: data.marker,
  //         distance: data.distance,
  //         driver: data.orderData,
  //       };

  //       router.push({
  //         pathname: "/(routes)/ride-details",
  //         params: {
  //           orderData: JSON.stringify(orderData),
  //         },
  //       });
  //     });

  //   return () => {
  //     if (notificationListener.current) {
  //       Notifications.removeNotificationSubscription(
  //         notificationListener.current,
  //       );
  //     }
  //   };
  // }, []);

  // =========================================================
  // Get current location
  // =========================================================

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;

        const current = {
          latitude,
          longitude,
        };

        setCurrentLocation(current);

        // Current location is pickup
        setPickup(current);

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.log("Current location error:", error);
      }
    })();
  }, []);

  // =========================================================
  // WebSocket
  // =========================================================

  const initializeWebSocket = () => {
    ws.current = new WebSocket("ws://192.168.1.2:8080");

    ws.current.onopen = () => {
      console.log("Connected to websocket server");
      setWsConnected(true);
    };

    ws.current.onerror = (error: any) => {
      console.log("WebSocket error:", error.message);
    };

    ws.current.onclose = (event: any) => {
      console.log("WebSocket closed:", event.code, event.reason);

      setWsConnected(false);
    };
  };

  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // =========================================================
  // Push notification registration
  // =========================================================

  // useEffect(() => {
  //   registerForPushNotificationsAsync();
  // }, []);

  // async function registerForPushNotificationsAsync() {
  //   if (!Device.isDevice) {
  //     console.log("Push notifications require a physical device");
  //     return;
  //   }

  //   const { status: existingStatus } =
  //     await Notifications.getPermissionsAsync();

  //   let finalStatus = existingStatus;

  //   if (existingStatus !== "granted") {
  //     const { status } = await Notifications.requestPermissionsAsync();

  //     finalStatus = status;
  //   }

  //   if (finalStatus !== "granted") {
  //     console.log("Push notification permission denied");
  //     return;
  //   }

  //   const projectId =
  //     Constants?.expoConfig?.extra?.eas?.projectId ??
  //     Constants?.easConfig?.projectId;

  //   if (!projectId) {
  //     console.log("Expo project ID missing");
  //     return;
  //   }

  //   try {
  //     const token = await Notifications.getExpoPushTokenAsync({
  //       projectId,
  //     });

  //     console.log("Push token:", token.data);
  //   } catch (error) {
  //     console.log("Push token error:", error);
  //   }

  //   if (Platform.OS === "android") {
  //     await Notifications.setNotificationChannelAsync("default", {
  //       name: "default",
  //       importance: Notifications.AndroidImportance.MAX,
  //       vibrationPattern: [0, 250, 250, 250],
  //     });
  //   }
  // }

  // =========================================================
  // Place selected
  // =========================================================

  const handlePlaceSelect = async (place: PlaceResult) => {
    try {
      const selectedDestination = {
        latitude: place.latitude,
        longitude: place.longitude,
      };

      setDropoff(place);

      setRegion({
        ...region,
        latitude: place.latitude,
        longitude: place.longitude,
      });

      setKeyboardAvoidingHeight(false);

      setLocationSelected(true);

      // -----------------------------------
      // Calculate route
      // -----------------------------------

      if (pickup) {
        const result = await getRoute(pickup, selectedDestination);

        if (result) {
          setRouteCoords(result.coords);

          setDistance(result.distanceKm);

          setTravelTime(result.durationMin);
        }
      }

      // -----------------------------------
      // Find nearby drivers
      // -----------------------------------

      requestNearbyDrivers();
    } catch (error) {
      console.log("Place selection error:", error);
    }
  };

  // =========================================================
  // Nearby drivers
  // =========================================================

  const getNearbyDrivers = () => {
    if (!ws.current) return;

    ws.current.onmessage = async (event: any) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "nearbyDrivers") {
          await getDriversData(message.drivers);
        }
      } catch (error) {
        console.log("WebSocket parsing error:", error);
      }
    };
  };

  const getDriversData = async (drivers: any[]) => {
    try {
      if (!drivers?.length) {
        setDriverLists([]);
        setDriverLoader(false);
        return;
      }

      const driverIds = drivers.map((driver) => driver.id).join(",");

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-drivers-data`,
        {
          params: {
            ids: driverIds,
          },
        },
      );

      setDriverLists(response.data);

      setDriverLoader(false);
    } catch (error) {
      console.log("Driver data error:", error);

      setDriverLoader(false);
    }
  };

  const requestNearbyDrivers = () => {
    if (!currentLocation || !ws.current || !wsConnected) {
      console.log("WebSocket not ready");
      return;
    }

    ws.current.send(
      JSON.stringify({
        type: "requestRide",
        role: "user",
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      }),
    );

    getNearbyDrivers();
  };
  // =========================================================
  // Distance
  // =========================================================

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const p = 0.017453292519943295;

    const c = Math.cos;

    const a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a));
  };

  useEffect(() => {
    if (pickup && dropoff) {
      const dist = calculateDistance(
        pickup.latitude,
        pickup.longitude,
        dropoff.latitude,
        dropoff.longitude,
      );

      setDistance(dist);
    }
  }, [pickup, dropoff]);

  // =========================================================
  // Arrival time
  // =========================================================

  const getEstimatedArrivalTime = () => {
    if (travelTime === null) {
      return "--";
    }

    return moment().add(travelTime, "minutes").format("hh:mm A");
  };

  // =========================================================
  // Push notification
  // =========================================================

  const sendPushNotification = async (expoPushToken: string, data: any) => {
    try {
      await axios.post("https://exp.host/--/api/v2/push/send", {
        to: expoPushToken,
        sound: "default",
        title: "New Ride Request",
        body: "You have a new ride request.",
        data: {
          orderData: data,
        },
      });
    } catch (error) {
      console.log("Push notification error:", error);
    }
  };

  // =========================================================
  // Confirm booking
  // =========================================================

  const handleOrder = async () => {
    if (!currentLocation || !dropoff || distance === null) {
      return;
    }

    try {
      /*
       * IMPORTANT:
       *
       * We are NOT using Google reverse geocoding here.
       *
       * For now we use the selected place's
       * display_name as destination name.
       *
       * Current location can later be reverse-geocoded
       * through your backend/provider.
       */

      const data = {
        user,

        currentLocation,

        marker: {
          latitude: dropoff.latitude,
          longitude: dropoff.longitude,
        },

        distance: distance.toFixed(2),

        currentLocationName: "Current Location",

        destinationLocation: dropoff.description,

        vehicleType: selectedVehicle,
      };

      console.log("Ride order:", data);

      const driverPushToken = "ExponentPushToken[v1e34ML-hnypD7MKQDDwaK]";

      await sendPushNotification(driverPushToken, JSON.stringify(data));
    } catch (error) {
      console.log("Order error:", error);
    }
  };

  // =========================================================
  // MAP
  // =========================================================

  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ================= MAP ================= */}

      <View>
        <View
          style={{
            height: windowHeight(!keyboardAvoidingHeight ? 500 : 300),
          }}
        >
          <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            rotateEnabled={true}
            zoomEnabled={true}
            zoomControlEnabled={true}
            showsCompass={true}
            pitchEnabled={true}
            scrollEnabled={true}
          >
            {/* Pickup */}

            <UrlTile
              urlTemplate={`https://api.maptiler.com/maps/positron-v4/256/{z}/{x}/{y}.png?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
              maximumZ={20}
            />

            {currentLocation && (
              <Marker coordinate={currentLocation} title="Pickup" />
            )}

            {/* Destination */}

            {dropoff && (
              <Marker
                coordinate={{
                  latitude: dropoff.latitude,
                  longitude: dropoff.longitude,
                }}
                title="Dropoff"
                pinColor="red"
              />
            )}

            {/* Route */}

            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}
          </MapView>

          {/* Attribution */}

          <View
            style={{
              position: "absolute",
              bottom: 5,
              right: 5,
              backgroundColor: "rgba(255,255,255,0.8)",
              paddingHorizontal: 5,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: 9,
              }}
            >
              © MapTiler © OpenStreetMap contributors
            </Text>
          </View>
        </View>
      </View>

      {/* ================= BOTTOM ================= */}

      <View style={styles.contentContainer}>
        <View style={styles.container}>
          {/* ================================================= */}
          {/* GATHERING OPTIONS */}
          {/* ================================================= */}

          {locationSelected ? (
            <>
              {driverLoader ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    height: 400,
                  }}
                >
                  <ActivityIndicator size="large" />
                </View>
              ) : (
                <ScrollView
                  style={{
                    paddingBottom: windowHeight(20),
                    height: windowHeight(280),
                  }}
                >
                  {/* Header */}

                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#b5b5b5",
                      paddingBottom: windowHeight(10),
                      flexDirection: "row",
                    }}
                  >
                    <Pressable onPress={() => setLocationSelected(false)}>
                      <LeftArrow />
                    </Pressable>

                    <Text
                      style={{
                        margin: "auto",
                        fontSize: 20,
                        fontWeight: "600",
                      }}
                    >
                      Gathering options
                    </Text>
                  </View>

                  {/* Vehicles */}

                  <View
                    style={{
                      padding: windowWidth(10),
                    }}
                  >
                    {driverLists.map((driver: any, index) => (
                      <Pressable
                        key={driver.id ?? index}
                        style={{
                          width: windowWidth(420),

                          borderWidth:
                            selectedVehicle === driver.vehicle_type ? 2 : 0,

                          borderRadius: 10,

                          padding: 10,

                          marginVertical: 5,
                        }}
                        onPress={() => setSelectedVehicle(driver.vehicle_type)}
                      >
                        {/* Vehicle image */}

                        <View
                          style={{
                            alignItems: "center",
                          }}
                        >
                          <Image
                            source={
                              driver.vehicle_type === "Car"
                                ? require("@/assets/images/vehicles/car.png")
                                : require("@/assets/images/vehicles/bike.png")
                            }
                            style={{
                              width: 90,
                              height: 80,
                            }}
                          />
                        </View>

                        {/* Vehicle info */}

                        <View
                          style={{
                            flexDirection: "row",

                            alignItems: "center",

                            justifyContent: "space-between",
                          }}
                        >
                          <View>
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: "600",
                              }}
                            >
                              Rawaan {driver.vehicle_type}
                            </Text>

                            <Text
                              style={{
                                fontSize: 16,
                              }}
                            >
                              {getEstimatedArrivalTime()} dropoff
                            </Text>
                          </View>

                          <Text
                            style={{
                              fontSize: windowWidth(20),
                              fontWeight: "600",
                            }}
                          >
                            PKR{" "}
                            {distance !== null
                              ? (
                                  distance * parseInt(driver.rate || "0")
                                ).toFixed(2)
                              : "0.00"}
                          </Text>
                        </View>
                      </Pressable>
                    ))}

                    {/* Confirm */}

                    <View
                      style={{
                        paddingHorizontal: windowWidth(10),

                        marginTop: windowHeight(15),
                      }}
                    >
                      <Button
                        backgroundColor="#000"
                        textColor="#fff"
                        title="Confirm Booking"
                        onPress={handleOrder}
                      />
                    </View>
                  </View>
                </ScrollView>
              )}
            </>
          ) : (
            <>
              {/* ================================================= */}
              {/* PLAN YOUR RIDE */}
              {/* ================================================= */}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={() => router.back()}>
                  <LeftArrow />
                </TouchableOpacity>

                <Text
                  style={{
                    margin: "auto",
                    fontSize: windowWidth(25),
                    fontWeight: "600",
                  }}
                >
                  Plan your ride
                </Text>
              </View>

              {/* Pickup now */}

              <View
                style={{
                  width: windowWidth(200),

                  height: windowHeight(28),

                  borderRadius: 20,

                  backgroundColor: color.lightGray,

                  alignItems: "center",

                  justifyContent: "center",

                  marginVertical: windowHeight(10),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Clock />

                  <Text
                    style={{
                      fontSize: windowHeight(12),
                      fontWeight: "600",
                      paddingHorizontal: 8,
                    }}
                  >
                    Pick-up now
                  </Text>

                  <DownArrow />
                </View>
              </View>

              {/* ================================================= */}
              {/* PICKUP / DESTINATION */}
              {/* ================================================= */}

              <View
                style={{
                  borderWidth: 2,
                  borderColor: "#000",
                  borderRadius: 15,

                  marginBottom: windowHeight(15),

                  paddingHorizontal: windowWidth(15),

                  paddingVertical: windowHeight(5),
                }}
              >
                {/* Current location */}

                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <PickLocation />

                  <View
                    style={{
                      width: Dimensions.get("window").width - 110,

                      borderBottomWidth: 1,

                      borderBottomColor: "#999",

                      marginLeft: 5,

                      height: windowHeight(20),
                    }}
                  >
                    <Text
                      style={{
                        color: "#2371F0",
                        fontSize: 18,
                        paddingLeft: 5,
                      }}
                    >
                      Current Location
                    </Text>
                  </View>
                </View>

                {/* Destination */}

                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 12,
                  }}
                >
                  <PlaceHolder />

                  <View
                    style={{
                      marginLeft: 5,

                      width: Dimensions.get("window").width - 110,
                    }}
                  >
                    <PlaceSearchInput
                      placeholder="Where to?"
                      onSelect={(place) => {
                        setKeyboardAvoidingHeight(false);

                        handlePlaceSelect(place);
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Distance */}

              {distance !== null && travelTime !== null && (
                <View
                  style={{
                    marginTop: windowHeight(5),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {distance.toFixed(1)} km · {travelTime.toFixed(0)} min
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
