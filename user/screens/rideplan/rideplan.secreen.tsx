import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Keyboard,
} from "react-native";

import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { windowHeight, windowWidth } from "@/themes/app.constant";

import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { router } from "expo-router";

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

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ============================================================
// RAWAAN DESIGN TOKENS
// ============================================================

const palette = {
  tealDark: "#0F4C4A",
  teal: "#176B68",
  tealLight: "#23817D",
  tealSoft: "#E7F2F1",

  amber: "#F5A524",
  amberSoft: "#FFF4DD",

  ivory: "#FBF8F2",
  white: "#FFFFFF",

  textDark: "#172525",
  textMuted: "#7A8585",
  textLight: "#A2AAAA",

  border: "#E4EAEA",
  borderTeal: "#D5E8E6",

  coral: "#E85C4A",
  coralSoft: "#FDECEA",

  green: "#4C9A6A",
  greenSoft: "#EAF5EE",

  graySoft: "#F4F6F6",
};

// ============================================================
// COMPONENT
// ============================================================

export default function RidePlanScreen() {
  const { user } = useUser();

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

  // ============================================================
  // KEYBOARD
  // ============================================================

  useEffect(() => {
    const keyboardShow = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardAvoidingHeight(true);
    });

    const keyboardHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardAvoidingHeight(false);
    });

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, []);

  // ============================================================
  // WEBSOCKET LIFECYCLE
  // ============================================================

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

  // ============================================================
  // LOCATION INITIALIZATION
  // ============================================================

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

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // REVERSE GEOCODING
  // ============================================================

  useEffect(() => {
    if (currentLocation) {
      reverseGeocode(currentLocation.latitude, currentLocation.longitude).then(
        (name) => {
          if (name) {
            setCurrentLocationName(name);
          }
        },
      );
    }
  }, [currentLocation]);

  // ============================================================
  // DESTINATION SELECTION
  // ============================================================

  const handlePlaceSelect = async (place: PlaceResult) => {
    try {
      Keyboard.dismiss();

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

  // ============================================================
  // REQUEST NEARBY DRIVERS
  // ============================================================

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
        if (prev) {
          console.log("No driver response in time");
        }

        return false;
      });
    }, 8000);
  };

  // ============================================================
  // DRIVER DATA
  // ============================================================

  const getDriversData = async (drivers: any[]) => {
    try {
      if (!drivers?.length) {
        setDriverLists([]);
        setDriverLoader(false);
        return;
      }

      const driverIds = drivers.map((driver) => driver.id).join(",");

      const response = await api.get(`/driver/get-drivers-data`, {
        params: {
          ids: driverIds,
        },
      });

      setDriverLists(response.data);
    } catch (error) {
      console.log("Driver data error:", error);
    } finally {
      setDriverLoader(false);
    }
  };

  // ============================================================
  // DISTANCE
  // ============================================================

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

  // ============================================================
  // ARRIVAL TIME
  // ============================================================

  const getEstimatedArrivalTime = () => {
    if (travelTime === null) {
      return "--";
    }

    return moment().add(travelTime, "minutes").format("hh:mm A");
  };

  // ============================================================
  // PUSH NOTIFICATION
  // ============================================================

  const sendPushNotification = async (expoPushToken: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Ride Request",
      body: "You have a new ride request.",
      data: {
        orderData: data,
      },
    };

    await axios
      .post("https://exp.host/--/api/v2/push/send", message)
      .catch((error) => console.log(error));
  };

  // ============================================================
  // ORDER
  // ============================================================

  const handleOrder = async () => {
    if (!currentLocation || !dropoff || distance === null) {
      return;
    }

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

  // ============================================================
  // RESPONSIVE MAP HEIGHT
  // ============================================================

  const mapHeight = keyboardAvoidingHeight
    ? windowHeight(250)
    : locationSelected
      ? windowHeight(330)
      : windowHeight(390);

  // ============================================================
  // UI
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={palette.tealDark} />

      {/* ======================================================
          MAP
      ====================================================== */}

      <View
        style={[
          styles.mapWrapper,
          {
            height: mapHeight,
          },
        ]}
      >
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
              pinColor={palette.coral}
            />
          )}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor={palette.teal}
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
                      color={palette.tealDark}
                    />
                  </View>

                  <ActivityIndicator size="small" color={palette.teal} />

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
                        color={palette.tealDark}
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
                        color={palette.tealDark}
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
                            color={palette.tealDark}
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
                            color={palette.tealDark}
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

                            setSelectedDriverId(driver.id);
                          }}
                        >
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Ionicons
                                name="checkmark"
                                size={13}
                                color={palette.white}
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
                                  color={palette.textMuted}
                                />

                                <Text style={styles.driverMetaText}>
                                  {getEstimatedArrivalTime()} dropoff
                                </Text>
                              </View>

                              <View style={styles.driverMetaItem}>
                                <Ionicons
                                  name="checkmark-circle-outline"
                                  size={14}
                                  color={palette.green}
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
                      backgroundColor={palette.tealDark}
                      textColor={palette.white}
                      title="Confirm Booking"
                      onPress={handleOrder}
                    />

                    <View style={styles.bookingSecure}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={14}
                        color={palette.teal}
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
                    color={palette.tealDark}
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
                    color={palette.tealDark}
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
                    color={palette.amber}
                  />
                </View>

                <View style={styles.pickupTimeContent}>
                  <Text style={styles.pickupTimeLabel}>PICKUP TIME</Text>

                  <Text style={styles.pickupTimeTitle}>Pick-up now</Text>
                </View>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color={palette.textMuted}
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
                      color={palette.tealDark}
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
                    <Ionicons name="location" size={17} color={palette.coral} />
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
                        color={palette.tealDark}
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
                        color={palette.tealDark}
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
                    color={wsConnected ? palette.green : palette.textMuted}
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
                        ? palette.green
                        : palette.textLight,
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

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // SCREEN
  // ==========================================================

  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ==========================================================
  // MAP
  // ==========================================================

  mapWrapper: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#E8EEEE",
    position: "relative",
  },

  map: {
    flex: 1,
  },

  mapStatus: {
    position: "absolute",
    top: windowHeight(12),
    left: windowWidth(15),

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.95)",

    paddingHorizontal: windowWidth(10),

    paddingVertical: windowHeight(7),

    borderRadius: 14,

    borderWidth: 1,
    borderColor: palette.border,

    elevation: 3,
  },

  mapStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.green,
    marginRight: 6,
  },

  mapStatusText: {
    fontSize: 9,
    fontWeight: "700",
    color: palette.textDark,
  },

  mapAttribution: {
    position: "absolute",
    bottom: 6,
    right: 6,

    backgroundColor: "rgba(255,255,255,0.90)",

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 6,

    borderWidth: 1,
    borderColor: palette.border,
  },

  mapAttributionText: {
    fontSize: 7,
    color: palette.textMuted,
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  contentContainer: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  container: {
    flex: 1,
    paddingHorizontal: windowWidth(17),
    paddingTop: windowHeight(14),
  },

  planScrollContent: {
    paddingBottom: windowHeight(20),
  },

  // ==========================================================
  // PLAN HEADER
  // ==========================================================

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: windowHeight(14),
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: palette.white,

    borderWidth: 1,
    borderColor: palette.border,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,

    elevation: 1,
  },

  planHeaderText: {
    flex: 1,
  },

  planEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.7,
    color: palette.amber,
    marginBottom: 2,
  },

  planTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: palette.textDark,
  },

  planSubtitle: {
    fontSize: 11,
    color: palette.textMuted,
    marginTop: 2,
  },

  planIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.tealSoft,

    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // PICKUP TIME
  // ==========================================================

  pickupTimeCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: palette.border,

    padding: windowWidth(11),

    marginBottom: windowHeight(11),

    elevation: 1,
  },

  pickupTimeIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,

    backgroundColor: palette.amberSoft,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  pickupTimeContent: {
    flex: 1,
  },

  pickupTimeLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: palette.textMuted,
    marginBottom: 2,
  },

  pickupTimeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.textDark,
  },

  // ==========================================================
  // LOCATION CARD
  // ==========================================================

  locationCard: {
    backgroundColor: palette.white,

    borderRadius: 20,

    paddingHorizontal: windowWidth(13),

    paddingVertical: windowHeight(13),

    borderWidth: 1,
    borderColor: palette.border,

    marginBottom: windowHeight(11),

    elevation: 3,

    // Sits above the pickup-time card and below the destination
    // dropdown (which uses zIndex 999 internally).
    zIndex: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  pickupLocationIcon: {
    backgroundColor: palette.tealSoft,
  },

  destinationLocationIcon: {
    backgroundColor: palette.coralSoft,
  },

  locationContent: {
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
  },

  locationLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: palette.textMuted,
    marginBottom: 2,
  },

  currentLocationText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.textDark,
  },

  locationConnector: {
    height: 16,
    width: 38,

    alignItems: "center",
    justifyContent: "center",

    zIndex: 1,
  },

  connectorLine: {
    height: 15,
    width: 1.5,

    backgroundColor: "#C8D8D7",
  },

  // ==========================================================
  // TRIP INFO
  // ==========================================================

  tripInfoCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.tealSoft,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: palette.borderTeal,

    paddingHorizontal: windowWidth(12),

    paddingVertical: windowHeight(10),

    marginBottom: windowHeight(11),
  },

  tripInfoItem: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  tripInfoIcon: {
    width: 33,
    height: 33,

    borderRadius: 11,

    backgroundColor: palette.white,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 7,
  },

  tripInfoLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: palette.textMuted,
  },

  tripInfoValue: {
    fontSize: 12,
    fontWeight: "800",
    color: palette.tealDark,
    marginTop: 1,
  },

  tripInfoDivider: {
    width: 1,
    height: 29,

    backgroundColor: "#C9DCDA",

    marginHorizontal: 8,
  },

  // ==========================================================
  // CONNECTION
  // ==========================================================

  connectionCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.white,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: palette.border,

    padding: windowWidth(10),

    marginTop: 1,
  },

  connectionIcon: {
    width: 34,
    height: 34,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  connectionIconOnline: {
    backgroundColor: palette.greenSoft,
  },

  connectionIconOffline: {
    backgroundColor: "#F0F2F2",
  },

  connectionContent: {
    flex: 1,
  },

  connectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: palette.textDark,
  },

  connectionSubtitle: {
    fontSize: 9,
    color: palette.textMuted,
    marginTop: 2,
  },

  connectionStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 7,
  },

  // ==========================================================
  // OPTIONS
  // ==========================================================

  optionsScroll: {
    flex: 1,
  },

  optionsScrollContent: {
    paddingBottom: 20,
  },

  optionsHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: windowHeight(12),
  },

  optionsHeaderText: {
    flex: 1,
  },

  optionsEyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: palette.amber,
    marginBottom: 2,
  },

  optionsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.textDark,
  },

  optionsSubtitle: {
    fontSize: 10,
    color: palette.textMuted,
    marginTop: 2,
  },

  optionsHeaderIcon: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: palette.tealSoft,

    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // ROUTE SUMMARY
  // ==========================================================

  routeSummaryCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: palette.border,

    padding: windowWidth(10),

    marginBottom: windowHeight(14),
  },

  routeSummaryItem: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  routeSummaryIcon: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: palette.tealSoft,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 7,
  },

  routeSummaryLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,

    color: palette.textMuted,
  },

  routeSummaryValue: {
    fontSize: 12,
    fontWeight: "800",

    color: palette.textDark,

    marginTop: 2,
  },

  routeDivider: {
    width: 1,
    height: 29,

    backgroundColor: palette.border,

    marginHorizontal: 8,
  },

  // ==========================================================
  // VEHICLE HEADER
  // ==========================================================

  vehicleSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",

    marginBottom: windowHeight(9),
  },

  vehicleEyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.4,

    color: palette.teal,

    marginBottom: 2,
  },

  vehicleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.textDark,
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.greenSoft,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 10,
  },

  availableDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: palette.green,

    marginRight: 5,
  },

  availableText: {
    fontSize: 9,
    fontWeight: "700",
    color: palette.green,
  },

  // ==========================================================
  // DRIVER CARDS
  // ==========================================================

  driverList: {
    gap: windowHeight(8),
  },

  driverCard: {
    position: "relative",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: palette.white,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: palette.border,

    padding: windowWidth(10),

    minHeight: windowHeight(96),

    elevation: 1,
  },

  driverCardSelected: {
    borderWidth: 1.5,
    borderColor: palette.teal,

    backgroundColor: "#F7FBFA",
  },

  selectedBadge: {
    position: "absolute",

    right: 8,
    top: 8,

    width: 23,
    height: 23,

    borderRadius: 8,

    backgroundColor: palette.teal,

    alignItems: "center",
    justifyContent: "center",

    zIndex: 5,
  },

  vehicleImageWrapper: {
    width: 85,
    height: 74,

    borderRadius: 15,

    backgroundColor: "#F5F7F7",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  vehicleImageWrapperSelected: {
    backgroundColor: palette.tealSoft,
  },

  vehicleImage: {
    width: 74,
    height: 63,
  },

  driverInfo: {
    flex: 1,
    minWidth: 0,
  },

  driverTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  driverNameArea: {
    flex: 1,
    marginRight: 6,
  },

  driverName: {
    fontSize: 12,
    fontWeight: "800",
    color: palette.textDark,
    paddingRight: 15,
  },

  vehicleTypeBadge: {
    alignSelf: "flex-start",

    backgroundColor: palette.tealSoft,

    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 7,

    marginTop: 4,
  },

  vehicleTypeText: {
    fontSize: 8,
    fontWeight: "800",
    color: palette.tealDark,
    letterSpacing: 0.4,
  },

  driverPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: palette.tealDark,
  },

  driverMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",

    marginTop: 7,
  },

  driverMetaItem: {
    flexDirection: "row",
    alignItems: "center",

    marginRight: 10,
  },

  driverMetaText: {
    fontSize: 8.5,
    color: palette.textMuted,
    marginLeft: 3,
  },

  // ==========================================================
  // BOOKING
  // ==========================================================

  bookingSection: {
    marginTop: windowHeight(15),

    paddingTop: 2,
  },

  bookingSecure: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: windowHeight(8),
  },

  bookingSecureText: {
    fontSize: 9,
    color: palette.textMuted,
    marginLeft: 5,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    flex: 1,

    minHeight: windowHeight(260),

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: windowWidth(20),
  },

  loadingIcon: {
    width: 60,
    height: 60,

    borderRadius: 19,

    backgroundColor: palette.tealSoft,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: windowHeight(11),
  },

  loadingTitle: {
    fontSize: 16,
    fontWeight: "800",

    color: palette.textDark,

    marginTop: windowHeight(10),
  },

  loadingSubtitle: {
    fontSize: 10.5,

    color: palette.textMuted,

    textAlign: "center",

    marginTop: 4,
  },
});
