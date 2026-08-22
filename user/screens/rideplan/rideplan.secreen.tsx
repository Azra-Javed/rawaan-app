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

import { Clock, LeftArrow, PickLocation } from "@/utils/icons";
import color from "@/themes/app.colors";
import DownArrow from "@/assets/icons/downArrow";
import PlaceHolder from "@/assets/icons/placeHolder";

import * as Location from "expo-location";
import moment from "moment";

import Button from "@/components/common/button";
import { getRoute, type Coord } from "@/utils/osrm";
import { reverseGeocode, type PlaceResult } from "@/utils/nominatim";
import { useUser } from "@/hooks/useUser";
import PlaceSearchInput from "@/components/location/placeSearchInput";

import {
  connectWebSocket,
  sendWebSocketMessage,
  disconnectWebSocket,
} from "@/utils/websocket";
import { Toast } from "react-native-toast-notifications";
import api from "@/api/client";
import axios from "axios";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RidePlanScreen() {
  const { user } = useUser();
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );

  const [wsConnected, setWsConnected] = useState(false);
  const [region, setRegion] = useState({
    latitude: 31.5497,
    longitude: 74.3436,
    latitudeDelta: 0.9,
    longitudeDelta: 0.1,
  });

  const [currentLocation, setCurrentLocation] = useState<Coord | null>(null);
  const [pickup, setPickup] = useState<Coord | null>(null);
  const [dropoff, setDropoff] = useState<PlaceResult | null>(null);
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<number | null>(null);

  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const [keyboardAvoidingHeight, setKeyboardAvoidingHeight] = useState(false);

  const [driverLists, setDriverLists] = useState<any[]>([]);
  const [driverLoader, setDriverLoader] = useState(false);
  const [currentLocationName, setCurrentLocationName] =
    useState("Current Location");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  // WebSocket lifecycle
  useEffect(() => {
    connectWebSocket(
      (message) => {
        if (message.type === "nearbyDrivers") {
          getDriversData(message.drivers);
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

  // Location initialization with unmount protection
  useEffect(() => {
    let isMounted = true;

    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Toast.show(
            "Please give access to your location to use this application",
            {
              type: "danger",
            },
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!isMounted) return;

        const { latitude, longitude } = location.coords;
        const current = { latitude, longitude };

        setCurrentLocation(current);
        setPickup(current);
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.log("Current location error:", error);
      }
    };

    getCurrentLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reverse geocoding
  useEffect(() => {
    if (currentLocation) {
      reverseGeocode(currentLocation.latitude, currentLocation.longitude).then(
        (name) => {
          if (name) setCurrentLocationName(name);
        },
      );
    }
  }, [currentLocation]);

  // Destination selection
  const handlePlaceSelect = async (place: PlaceResult) => {
    try {
      const destination = {
        latitude: place.latitude,
        longitude: place.longitude,
      };

      setDropoff(place);
      setRegion((prev) => ({
        ...prev,
        latitude: place.latitude,
        longitude: place.longitude,
      }));
      setKeyboardAvoidingHeight(false);
      setLocationSelected(true);

      if (pickup) {
        const result = await getRoute(pickup, destination);
        if (result) {
          setRouteCoords(result.coords);
          setDistance(result.distanceKm);
          setTravelTime(result.durationMin);
        }
      }
      requestNearbyDrivers();
    } catch (error) {
      console.log("Place selection error:", error);
    }
  };

  const requestNearbyDrivers = () => {
    if (!currentLocation || !wsConnected) {
      setDriverLoader(false);
      return;
    }

    setDriverLoader(true);

    sendWebSocketMessage({
      type: "requestRide",
      role: "user",
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    });

    setTimeout(() => {
      setDriverLoader((prev) => {
        if (prev) console.log("No driver response in time");
        return false;
      });
    }, 8000);
  };

  const getDriversData = async (drivers: any[]) => {
    try {
      if (!drivers?.length) {
        setDriverLists([]);
        setDriverLoader(false);
        return;
      }

      const driverIds = drivers.map((driver) => driver.id).join(",");
      const response = await api.get(`/driver/get-drivers-data`, {
        params: { ids: driverIds },
      });

      setDriverLists(response.data);
    } catch (error) {
      console.log("Driver data error:", error);
    } finally {
      setDriverLoader(false);
    }
  };

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

  const getEstimatedArrivalTime = () => {
    if (travelTime === null) return "--";
    return moment().add(travelTime, "minutes").format("hh:mm A");
  };

  // Push Notifications Listener
  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        try {
          const payload = JSON.parse(
            notification?.request?.content?.data?.orderData as string,
          );

          if (payload.type === "rideAccepted") {
            router.push({
              pathname: "/(routes)/ride-details",
              params: { orderData: JSON.stringify(payload) },
            });
          }
        } catch (error) {
          console.log("Failed to process rider notification:", error);
        }
      });

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  const sendPushNotification = async (expoPushToken: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Ride Request",
      body: "You have a new ride request.",
      data: { orderData: data },
    };

    await axios
      .post("https://exp.host/--/api/v2/push/send", message)
      .catch((error) => console.log(error));
  };

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

        await api.put("/user/update-push-token", {
          pushToken: pushTokenString,
        });
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

  const handleOrder = async () => {
    if (!currentLocation || !dropoff || distance === null) return;

    const selectedDriver = driverLists.find((d) => d.id === selectedDriverId);

    if (!selectedDriver?.pushToken) {
      Toast.show("Selected driver is not available for notifications", {
        type: "danger",
      });
      return;
    }

    try {
      const data = {
        user,
        currentLocation,
        marker: {
          latitude: dropoff.latitude,
          longitude: dropoff.longitude,
        },
        distance: distance.toFixed(2),
        currentLocationName,
        destinationLocation: dropoff.description,
        vehicleType: selectedVehicle,
      };

      await sendPushNotification(
        selectedDriver.pushToken,
        JSON.stringify(data),
      );
    } catch (error) {
      console.log("Order error:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View>
        <View
          style={{ height: windowHeight(!keyboardAvoidingHeight ? 500 : 300) }}
        >
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

            {currentLocation && (
              <Marker coordinate={currentLocation} title="Pickup" />
            )}

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
              backgroundColor: "rgba(255,255,255,0.8)",
              paddingHorizontal: 5,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 9 }}>
              © MapTiler © OpenStreetMap contributors
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.container}>
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

                  <View style={{ padding: windowWidth(10) }}>
                    {driverLists.map((driver: any, index) => (
                      <Pressable
                        key={driver.id || index}
                        style={{
                          borderWidth:
                            selectedVehicle === driver.vehicle_type ? 2 : 0,
                          borderRadius: 10,
                          padding: 10,
                          marginVertical: 5,
                        }}
                        onPress={() => {
                          setSelectedVehicle(driver.vehicle_type);
                          setSelectedDriverId(driver.id);
                        }}
                      >
                        <View style={{ alignItems: "center" }}>
                          <Image
                            source={
                              driver.vehicle_type === "Car"
                                ? require("@/assets/images/vehicles/car.png")
                                : require("@/assets/images/vehicles/bike.png")
                            }
                            style={{ width: 90, height: 80 }}
                          />
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <View>
                            <Text style={{ fontSize: 20, fontWeight: "600" }}>
                              Rawaan {driver.vehicle_type}
                            </Text>

                            <Text style={{ fontSize: 16 }}>
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
                                  distance * parseFloat(driver.rate || "0")
                                ).toFixed(2)
                              : "0.00"}
                          </Text>
                        </View>
                      </Pressable>
                    ))}

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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                <View style={{ flexDirection: "row" }}>
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

                <View style={{ flexDirection: "row", paddingVertical: 12 }}>
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
                        handlePlaceSelect(place);
                      }}
                    />
                  </View>
                </View>
              </View>

              {distance !== null && travelTime !== null && (
                <View style={{ marginTop: windowHeight(5) }}>
                  <Text style={{ fontSize: 15 }}>
                    {distance.toFixed(1)} km · {travelTime.toFixed(0)} min
                  </Text>
                </View>
              )}

              <Text style={{ marginTop: 10, fontSize: 12 }}>
                WebSocket: {wsConnected ? "Connected" : "Disconnected"}
              </Text>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
