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
  StatusBar,
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
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { getUser, saveAuth } from "@/utils/authStorage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RidePlanScreen() {

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
  const { user: currentUser } = useUser();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

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
          const rawOrderData =
            notification?.request?.content?.data?.orderData;

          const payload =
            typeof rawOrderData === "string"
              ? JSON.parse(rawOrderData)
              : rawOrderData;

          console.log("Rider notification data:", payload);

          // DRIVER REJECTED THE REQUEST

          if (payload?.type === "rideRejected") {
            const rejectedDriverId = payload?.driverId;

            if (rejectedDriverId) {
              setDriverLists((prevDrivers) =>
                prevDrivers.filter(
                  (driver) =>
                    String(driver.id) !==
                    String(rejectedDriverId),
                ),
              );

              // If the rejected driver was selected,
              // clear the selection.
              setSelectedDriverId((currentSelectedId) =>
                String(currentSelectedId) ===
                  String(rejectedDriverId)
                  ? null
                  : currentSelectedId,
              );
            }

            Toast.show(
              "This driver is not available.Choose other driver for you.",
              {
                type: "danger",
              },
            );

            return;
          }


          // DRIVER ACCEPTED THE REQUEST

          if (payload?.type === "rideAccepted") {
            router.push({
              pathname: "/(routes)/ride-details",
              params: {
                orderData: JSON.stringify(payload),
              },
            });
          }
        } catch (error) {
          console.log(
            "Failed to process rider notification:",
            error,
          );
        }
      });

    return () => {
      notificationListener.current?.remove();
      notificationListener.current = null;
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

        console.log("========== USER PUSH TOKEN ==========");
        console.log("Project ID:", projectId);
        console.log("User ID:", user?.id);
        console.log("Push Token:", pushTokenString);
        console.log("=====================================");

        const response = await api.put("/user/update-push-token", {
          pushToken: pushTokenString,
        });



        setUser(response.data.user);
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

    const selectedDriver = driverLists.find(
      (d) => String(d.id) === String(selectedDriverId)
    );
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

  const insets = useSafeAreaInsets();

  let tabBarHeight = 0;

  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = 0;
  }

  const bottomSafeSpace = Math.max(
    insets.bottom,
    tabBarHeight,
    windowHeight(12),
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <View style={[styles.mapWrapper]}>
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

        {/* MAP STATUS */}

        <View style={styles.mapStatus}>
          <View style={styles.mapStatusDot} />

          <Text style={styles.mapStatusText}>
            {wsConnected ? "Live location" : "Connecting"}
          </Text>
        </View>

        {/* MAP ATTRIBUTION */}

        <View style={styles.mapAttribution}>
          <Text style={styles.mapAttributionText}>
            © MapTiler © OpenStreetMap contributors
          </Text>
        </View>
      </View>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <View
        style={[
          styles.contentContainer,
          {
            paddingBottom: bottomSafeSpace,
          },
        ]}
      >
        <View style={styles.container}>
          {locationSelected ? (
            <>
              {/* ==================================================
                  LOADING
              ================================================== */}

              {driverLoader ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingIcon}>
                    <Ionicons
                      name="car-outline"
                      size={27}
                      color={color.tealDark}
                    />
                  </View>

                  <ActivityIndicator size="small" color={color.teal} />

                  <Text style={styles.loadingTitle}>Finding nearby rides</Text>

                  <Text style={styles.loadingSubtitle}>
                    Looking for available drivers near you
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  style={styles.optionsScroll}
                  contentContainerStyle={[
                    styles.optionsScrollContent,
                    {
                      paddingBottom: bottomSafeSpace + windowHeight(20),
                    },
                  ]}
                >
                  {/* ==================================================
                      OPTIONS HEADER
                  ================================================== */}

                  <View style={styles.optionsHeader}>
                    <Pressable
                      onPress={() => setLocationSelected(false)}
                      style={styles.backButton}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={20}
                        color={color.tealDark}
                      />
                    </Pressable>

                    <View style={styles.optionsHeaderText}>
                      <Text style={styles.optionsEyebrow}>RAWAAN RIDE</Text>

                      <Text style={styles.optionsTitle}>Choose your ride</Text>

                      <Text style={styles.optionsSubtitle}>
                        Select the vehicle that suits you
                      </Text>
                    </View>

                    <View style={styles.optionsHeaderIcon}>
                      <Ionicons
                        name="car-outline"
                        size={20}
                        color={color.tealDark}
                      />
                    </View>
                  </View>

                  {/* ==================================================
                      ROUTE SUMMARY
                  ================================================== */}

                  {distance !== null && travelTime !== null && (
                    <View style={styles.routeSummaryCard}>
                      <View style={styles.routeSummaryItem}>
                        <View style={styles.routeSummaryIcon}>
                          <Ionicons
                            name="navigate-outline"
                            size={17}
                            color={color.tealDark}
                          />
                        </View>

                        <View>
                          <Text style={styles.routeSummaryLabel}>DISTANCE</Text>

                          <Text style={styles.routeSummaryValue}>
                            {distance.toFixed(1)} km
                          </Text>
                        </View>
                      </View>

                      <View style={styles.routeDivider} />

                      <View style={styles.routeSummaryItem}>
                        <View style={styles.routeSummaryIcon}>
                          <Ionicons
                            name="time-outline"
                            size={17}
                            color={color.tealDark}
                          />
                        </View>

                        <View>
                          <Text style={styles.routeSummaryLabel}>ARRIVAL</Text>

                          <Text style={styles.routeSummaryValue}>
                            {getEstimatedArrivalTime()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* ==================================================
                      VEHICLE HEADER
                  ================================================== */}

                  <View style={styles.vehicleSectionHeader}>
                    <View>
                      <Text style={styles.vehicleEyebrow}>AVAILABLE NOW</Text>

                      <Text style={styles.vehicleTitle}>Ride options</Text>
                    </View>

                    <View style={styles.availableBadge}>
                      <View style={styles.availableDot} />

                      <Text style={styles.availableText}>
                        {driverLists.length} available
                      </Text>
                    </View>
                  </View>

                  {/* ==================================================
                      DRIVERS
                  ================================================== */}

                  <View style={styles.driverList}>
                    {driverLists.map((driver: any, index) => {
                      const isSelected = selectedDriverId === driver.id;

                      return (
                        <Pressable
                          key={driver.id || index}
                          style={[
                            styles.driverCard,
                            isSelected && styles.driverCardSelected,
                          ]}

                          onPress={() => {


                            setSelectedVehicle(driver.vehicle_type);
                            setSelectedDriverId(String(driver.id));
                          }
                          }
                        >
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Ionicons
                                name="checkmark"
                                size={13}
                                color={color.white}
                              />
                            </View>
                          )}

                          <View
                            style={[
                              styles.vehicleImageWrapper,
                              isSelected && styles.vehicleImageWrapperSelected,
                            ]}
                          >
                            <Image
                              source={
                                driver.vehicle_type === "Car"
                                  ? require("@/assets/images/vehicles/car.png")
                                  : require("@/assets/images/vehicles/bike.png")
                              }
                              style={styles.vehicleImage}
                              resizeMode="contain"
                            />
                          </View>

                          <View style={styles.driverInfo}>
                            <View style={styles.driverTitleRow}>
                              <View style={styles.driverNameArea}>
                                <Text
                                  style={styles.driverName}
                                  numberOfLines={1}
                                >
                                  Rawaan {driver.vehicle_type}
                                </Text>

                                <View style={styles.vehicleTypeBadge}>
                                  <Text style={styles.vehicleTypeText}>
                                    {driver.vehicle_type}
                                  </Text>
                                </View>
                              </View>

                              <Text style={styles.driverPrice}>
                                PKR{" "}
                                {distance !== null
                                  ? (
                                    distance * parseFloat(driver.rate || "0")
                                  ).toFixed(2)
                                  : "0.00"}
                              </Text>
                            </View>

                            <View style={styles.driverMetaRow}>
                              <View style={styles.driverMetaItem}>
                                <Ionicons
                                  name="time-outline"
                                  size={14}
                                  color={color.textMuted}
                                />

                                <Text style={styles.driverMetaText}>
                                  {getEstimatedArrivalTime()} dropoff
                                </Text>
                              </View>

                              <View style={styles.driverMetaItem}>
                                <Ionicons
                                  name="checkmark-circle-outline"
                                  size={14}
                                  color={color.green}
                                />

                                <Text style={styles.driverMetaText}>
                                  Available
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* ==================================================
                      BOOKING
                  ================================================== */}

                  <View style={styles.bookingSection}>
                    <Button
                      backgroundColor={color.tealDark}
                      textColor={color.white}
                      title="Confirm Booking"
                      onPress={handleOrder}
                    />

                    <View style={styles.bookingSecure}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={14}
                        color={color.teal}
                      />

                      <Text style={styles.bookingSecureText}>
                        Your ride details are securely processed
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.planScrollContent,
                {
                  paddingBottom: bottomSafeSpace + windowHeight(15),
                },
              ]}
            >
              {/* ==================================================
                  HEADER
              ================================================== */}

              <View style={styles.planHeader}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={color.tealDark}
                  />
                </TouchableOpacity>

                <View style={styles.planHeaderText}>
                  <Text style={styles.planEyebrow}>RAWAAN</Text>

                  <Text style={styles.planTitle}>Plan your ride</Text>

                  <Text style={styles.planSubtitle}>
                    Where would you like to go?
                  </Text>
                </View>

                <View style={styles.planIcon}>
                  <Ionicons
                    name="location-outline"
                    size={21}
                    color={color.tealDark}
                  />
                </View>
              </View>

              {/* ==================================================
                  PICKUP TIME
              ================================================== */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.pickupTimeCard}
              >
                <View style={styles.pickupTimeIcon}>
                  <Ionicons
                    name="flash-outline"
                    size={16}
                    color={color.amber}
                  />
                </View>

                <View style={styles.pickupTimeContent}>
                  <Text style={styles.pickupTimeLabel}>PICKUP TIME</Text>

                  <Text style={styles.pickupTimeTitle}>Pick-up now</Text>
                </View>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color={color.textMuted}
                />
              </TouchableOpacity>

              {/* ==================================================
                  LOCATION CARD
                  NOTE: the destination row's dropdown is rendered as
                  an absolutely-positioned overlay by PlaceSearchInput
                  itself, so this card no longer needs manual zIndex /
                  elevation stacking to keep suggestions visible.
              ================================================== */}

              <View style={styles.locationCard}>
                {/* PICKUP */}

                <View style={styles.locationRow}>
                  <View
                    style={[styles.locationIcon, styles.pickupLocationIcon]}
                  >
                    <Ionicons
                      name="radio-button-on"
                      size={17}
                      color={color.tealDark}
                    />
                  </View>

                  <View style={styles.locationContent}>
                    <Text style={styles.locationLabel}>PICKUP</Text>

                    <Text style={styles.currentLocationText} numberOfLines={1}>
                      {currentLocationName}
                    </Text>
                  </View>
                </View>

                {/* CONNECTOR */}

                <View style={styles.locationConnector}>
                  <View style={styles.connectorLine} />
                </View>

                {/* DESTINATION */}

                <View style={styles.locationRow}>
                  <View
                    style={[
                      styles.locationIcon,
                      styles.destinationLocationIcon,
                    ]}
                  >
                    <Ionicons name="location" size={17} color={color.coral} />
                  </View>

                  <View style={styles.locationContent}>
                    <Text style={styles.locationLabel}>DESTINATION</Text>

                    <PlaceSearchInput
                      placeholder="Where to?"
                      onSelect={(place) => {
                        handlePlaceSelect(place);
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* ==================================================
                  ROUTE INFORMATION
              ================================================== */}

              {distance !== null && travelTime !== null && (
                <View style={styles.tripInfoCard}>
                  <View style={styles.tripInfoItem}>
                    <View style={styles.tripInfoIcon}>
                      <Ionicons
                        name="navigate-outline"
                        size={16}
                        color={color.tealDark}
                      />
                    </View>

                    <View>
                      <Text style={styles.tripInfoLabel}>DISTANCE</Text>

                      <Text style={styles.tripInfoValue}>
                        {distance.toFixed(1)} km
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripInfoDivider} />

                  <View style={styles.tripInfoItem}>
                    <View style={styles.tripInfoIcon}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={color.tealDark}
                      />
                    </View>

                    <View>
                      <Text style={styles.tripInfoLabel}>EST. TIME</Text>

                      <Text style={styles.tripInfoValue}>
                        {travelTime.toFixed(0)} min
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* ==================================================
                  CONNECTION STATUS
              ================================================== */}

              <View style={styles.connectionCard}>
                <View
                  style={[
                    styles.connectionIcon,
                    wsConnected
                      ? styles.connectionIconOnline
                      : styles.connectionIconOffline,
                  ]}
                >
                  <Ionicons
                    name={
                      wsConnected ? "wifi-outline" : "cloud-offline-outline"
                    }
                    size={15}
                    color={wsConnected ? color.green : color.textMuted}
                  />
                </View>

                <View style={styles.connectionContent}>
                  <Text style={styles.connectionTitle}>Driver network</Text>

                  <Text style={styles.connectionSubtitle}>
                    {wsConnected
                      ? "Connected and ready to find nearby drivers"
                      : "Connecting to nearby driver network"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.connectionStatusDot,
                    {
                      backgroundColor: wsConnected
                        ? color.green
                        : color.textLight,
                    },
                  ]}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
