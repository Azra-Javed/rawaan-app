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
import { useEffect, useState } from "react";
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

import { getRoute } from "@/utils/osrm";
import type { Coord } from "@/utils/osrm";
import type { PlaceResult } from "@/utils/nominatim";

import { useUser } from "@/hooks/useUser";
import PlaceSearchInput from "@/components/location/placeSearchInput";

import {
  connectWebSocket,
  sendWebSocketMessage,
  disconnectWebSocket,
} from "@/utils/websocket";
import { Toast } from "react-native-toast-notifications";
import api from "@/api/client";

export default function RidePlanScreen() {
  const { user } = useUser();

  const [wsConnected, setWsConnected] = useState(false);

  const [region, setRegion] = useState<any>({
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
  // FIX: was `useState(true)` -- loader should not be true before any request is made
  const [driverLoader, setDriverLoader] = useState(false);

  // WebSocket

  useEffect(() => {
    connectWebSocket(
      (message) => {
        console.log("WebSocket message:", message);

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

  // Current location
  useEffect(() => {
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

        const { latitude, longitude } = location.coords;

        const current = {
          latitude,
          longitude,
        };

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
  }, []);

  // Place selected
  const handlePlaceSelect = async (place: PlaceResult) => {
    try {
      const destination = {
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

  // Request nearby drivers

  const requestNearbyDrivers = () => {
    if (!currentLocation) {
      console.log("Current location not available");
      setDriverLoader(false);
      return;
    }

    if (!wsConnected) {
      console.log("WebSocket not connected");
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

    console.log("Nearby drivers requested");

    setTimeout(() => {
      setDriverLoader((prev) => {
        if (prev) {
          console.log("No driver response in time");
        }
        return false;
      });
    }, 8000);
  };

  // Get drivers information
  const getDriversData = async (drivers: any[]) => {
    try {
      if (!drivers?.length) {
        setDriverLists([]);
        setDriverLoader(false);
        return;
      }

      const driverIds = drivers.map((driver) => driver.id).join(",");

      console.log(driverIds);

      const response = await api.get(`/driver/get-drivers-data`, {
        params: {
          ids: driverIds,
        },
      });

      console.log(response);

      setDriverLists(response.data);
    } catch (error) {
      console.log("Driver data error:", error);
    } finally {
      setDriverLoader(false);
    }
  };

  // Distance
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

  // Arrival time

  const getEstimatedArrivalTime = () => {
    if (travelTime === null) {
      return "--";
    }

    return moment().add(travelTime, "minutes").format("hh:mm A");
  };

  // Order
  const handleOrder = async () => {
    if (!currentLocation || !dropoff || distance === null) {
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

        currentLocationName: "Current Location",

        destinationLocation: dropoff.description,

        vehicleType: selectedVehicle,
      };

      console.log("Ride order:", data);

      // send the booking
      // through WebSocket here.
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
          style={{
            height: windowHeight(!keyboardAvoidingHeight ? 500 : 300),
          }}
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

                  <View
                    style={{
                      padding: windowWidth(10),
                    }}
                  >
                    {driverLists.map((driver: any, index) => (
                      <Pressable
                        key={driver.id ?? index}
                        style={{
                          borderWidth:
                            selectedVehicle === driver.vehicle_type ? 2 : 0,
                          borderRadius: 10,
                          padding: 10,
                          marginVertical: 5,
                        }}
                        onPress={() => setSelectedVehicle(driver.vehicle_type)}
                      >
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
                        handlePlaceSelect(place);
                      }}
                    />
                  </View>
                </View>
              </View>

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

              <Text
                style={{
                  marginTop: 10,
                  fontSize: 12,
                }}
              >
                WebSocket: {wsConnected ? "Connected" : "Disconnected"}
              </Text>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
