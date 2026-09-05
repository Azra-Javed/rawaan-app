import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, Polyline, Region, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import color from "@/themes/app.colors";
import { getRoute, type Coord } from "@/utils/osrm";
import { connectWebSocket, disconnectWebSocket } from "@/utils/websocket";
import { useToast } from "react-native-toast-notifications";
import styles from "./styles";
import api from "@/api/client";

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
  const toast = useToast();
  const params = useLocalSearchParams();
  const orderDataParam = params.orderData;

  const [orderData, setOrderData] = useState<RideData | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("Processing");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Cash");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
const [selectedRating, setSelectedRating] = useState(0);
const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
      setOrderStatus(parsed?.ride?.status || "Processing");
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

  const handlePayment = () => {
    setPaymentModalVisible(false);
    setPaymentCompleted(true);
  };

  useEffect(() => {
  connectWebSocket((data) => {
    if (
      data.type === "rideStatusUpdated" &&
      data.rideId === orderData?.ride?.id
    ) {
      console.log(
        "Ride status changed to:",
        data.status
      );

      const status = String(data.status || "").toLowerCase();

      setOrderStatus(data.status);

      

      if (status === "ongoing") {
        setOrderStatus("Ongoing");
        toast.show("Your ride is in progress 🚗" , {type:"success"});
      }


      if (status === "completed") {
        toast.show(
          "Ride completed. Please rate your driver ⭐"
        , {type: "success"});

        setRatingModalVisible(true);
      }
    }
  });

  return () => {
    disconnectWebSocket();
  };
}, [orderData?.ride?.id]); 

const handleSubmitRating = async () => {
  if (selectedRating === 0) {
    toast.show("Please select a rating ⭐");
    return;
  }

  try {
    

      await api.put("/driver/rating", {
        rideId: orderData?.ride?.id,
        driverId: driver?.id,
        rating: selectedRating,
      });
    

    console.log("Rating submitted:", {
      rideId: orderData?.ride?.id,
      driverId: driver?.id,
      rating: selectedRating,
    });

    setRatingSubmitted(true);

  toast.show(
      "Thanks for rating your driver!"
    , { type: "success" });

    setTimeout(() => {
      setRatingModalVisible(false);
      router.replace("/");
    }, 700);

  } catch (error) {
    console.log(
      "Failed to submit driver rating:",
      error
    );

    toast.show(
      "Unable to submit rating. Please try again."
    , {type: "danger"});
  }
};
  if (!orderData) {
    return (
      <SafeAreaView style={styles.emptyScreen}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="car-outline"
            size={30}
            color={color.nightIndigo}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Ride information could not be loaded.
        </Text>

        <Text style={styles.emptySubtitle}>
          Please go back and try again.
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonEmpty}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={color.white}
          />

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
          <Ionicons
            name="arrow-back"
            size={21}
            color={color.nightIndigo}
          />
        </TouchableOpacity>

        {/* ROUTE LOADING */}

        {routeLoading && (
          <View style={styles.routeLoading}>
            <ActivityIndicator
              size="small"
              color={color.nightIndigo}
            />

            <Text style={styles.routeLoadingText}>
              Loading route...
            </Text>
          </View>
        )}

        {/* MAPTILER ATTRIBUTION */}

        <View style={styles.attribution}>
          <Text style={styles.attributionText}>
            © MapTiler © OpenStreetMap contributors
          </Text>
        </View>
      </View>

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <SafeAreaView
        edges={["bottom"]}
        style={styles.detailsContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailsContent}
        >
          <View style={styles.sheetHandle} />

          {/* HEADER */}

          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.eyebrow}>RAWAAN</Text>

              <Text style={styles.title}>Ride Details</Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {orderStatus}
              </Text>
            </View>
          </View>

          {/* DRIVER */}

          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Ionicons
                name="person"
                size={22}
                color={color.nightIndigo}
              />
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverLabel}>YOUR DRIVER</Text>

              <Text style={styles.driverName}>
                {driver?.name || "Driver"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.callButton,
                !driver?.phone_number &&
                styles.callButtonDisabled,
              ]}
              disabled={!driver?.phone_number}
              onPress={callDriver}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call"
                size={18}
                color={
                  driver?.phone_number
                    ? color.white
                    : color.muted
                }
              />
            </TouchableOpacity>
          </View>

          {/* DRIVER DETAILS */}

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="call-outline"
                  size={17}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>PHONE</Text>

                <Text
                  style={[
                    styles.detailValue,
                    driver?.phone_number &&
                    styles.phoneValue,
                  ]}
                >
                  {driver?.phone_number || "Unavailable"}
                </Text>
              </View>

              {driver?.phone_number && (
                <TouchableOpacity
                  onPress={callDriver}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="car-outline"
                  size={17}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>VEHICLE</Text>

                <Text style={styles.detailValue}>
                  {driver?.vehicle_type || "N/A"}
                </Text>
              </View>

              <View style={styles.vehicleColor}>
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor:
                        driver?.vehicle_color?.toLowerCase() ||
                        "#AAB5B5",
                    },
                  ]}
                />

                <Text style={styles.vehicleColorText}>
                  {driver?.vehicle_color || "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>DISTANCE</Text>

                <Text style={styles.detailValue}>
                  {distance.toFixed(2)} km
                </Text>
              </View>
            </View>
          </View>

          {/* PAYMENT */}
          {
            orderStatus === "Ongoing" && (<View style={styles.paymentSection}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>Payment</Text>

                {paymentCompleted && (
                  <View style={styles.paidBadge}>
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={color.white}
                    />

                    <Text style={styles.paidText}>Paid</Text>
                  </View>
                )}
              </View>

              <View style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentLabel}>
                    TOTAL FARE
                  </Text>

                  <Text style={styles.paymentAmount}>
                    {payableAmount.toFixed(2)}{" "}
                    <Text style={styles.paymentCurrency}>PKR</Text>
                  </Text>
                </View>

                {!paymentCompleted && (
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => setPaymentModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.payButtonText}>
                      Pay Now
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={color.white}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {paymentCompleted && (
                <View style={styles.paymentSuccess}>
                  <Ionicons
                    name="checkmark-circle"
                    size={17}
                    color={color.buttonBg}
                  />

                  <Text style={styles.paymentSuccessText}>
                    Payment completed successfully
                  </Text>
                </View>
              )}
            </View>
            )
          }


          {/* SIMPLE NOTE */}

          <View style={styles.noteRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={color.buttonBg}
            />

            <Text style={styles.noteText}>
              Your ride details are safe and secure.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Pay for ride</Text>

                <Text style={styles.modalSubtitle}>
                  Choose your payment method
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPaymentModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={color.nightIndigo}
                />
              </TouchableOpacity>
            </View>

            {/* AMOUNT */}

            <View style={styles.modalAmountBox}>
              <Text style={styles.modalAmountLabel}>
                AMOUNT TO PAY
              </Text>

              <Text style={styles.modalAmount}>
                {payableAmount.toFixed(2)}{" "}
                <Text style={styles.modalCurrency}>PKR</Text>
              </Text>
            </View>

            {/* PAYMENT METHODS */}

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === "Cash" &&
                styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPaymentMethod("Cash")}
              activeOpacity={0.8}
            >
              <View style={styles.paymentMethodIcon}>
                <Ionicons
                  name="cash-outline"
                  size={21}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodTitle}>
                  Cash
                </Text>

                <Text style={styles.paymentMethodSubtitle}>
                  Pay directly to your driver
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  selectedPaymentMethod === "Cash" &&
                  styles.radioSelected,
                ]}
              >
                {selectedPaymentMethod === "Cash" && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === "Card" &&
                styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPaymentMethod("Card")}
              activeOpacity={0.8}
            >
              <View style={styles.paymentMethodIcon}>
                <Ionicons
                  name="card-outline"
                  size={21}
                  color={color.nightIndigo}
                />
              </View>

              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodTitle}>
                  Card
                </Text>

                <Text style={styles.paymentMethodSubtitle}>
                  Pay securely with your card
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  selectedPaymentMethod === "Card" &&
                  styles.radioSelected,
                ]}
              >
                {selectedPaymentMethod === "Card" && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>

            {/* CONFIRM */}

            <TouchableOpacity
              style={styles.confirmPaymentButton}
              onPress={handlePayment}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmPaymentText}>
                Confirm Payment
              </Text>

              <Ionicons
                name="checkmark"
                size={18}
                color={color.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =====================================================
    DRIVER RATING MODAL
===================================================== */}

<Modal
  visible={ratingModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => {}}
>
  <View style={styles.ratingOverlay}>
    <View style={styles.ratingModal}>
      {/* Handle */}

      <View style={styles.modalHandle} />

      {/* Icon */}

      <View style={styles.ratingIcon}>
        <Ionicons
          name="star"
          size={25}
          color={color.routeAmber}
        />
      </View>

      {/* Heading */}

      <Text style={styles.ratingTitle}>
        How was your ride?
      </Text>

      <Text style={styles.ratingSubtitle}>
        Your feedback helps us improve the
        Rawaan experience.
      </Text>

      {/* Driver */}

      <View style={styles.ratingDriver}>
        <View style={styles.ratingDriverAvatar}>
          <Ionicons
            name="person"
            size={21}
            color={color.nightIndigo}
          />
        </View>

        <View style={styles.ratingDriverInfo}>
          <Text style={styles.ratingDriverLabel}>
            YOUR DRIVER
          </Text>

          <Text style={styles.ratingDriverName}>
            {driver?.name || "Driver"}
          </Text>
        </View>
      </View>

      {/* Stars */}

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setSelectedRating(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Ionicons
              name={
                star <= selectedRating
                  ? "star"
                  : "star-outline"
              }
              size={38}
              color={color.routeAmber}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Rating text */}

      <Text style={styles.ratingText}>
        {selectedRating === 0
          ? "Tap a star to rate"
          : selectedRating === 1
          ? "Very poor"
          : selectedRating === 2
          ? "Poor"
          : selectedRating === 3
          ? "Good"
          : selectedRating === 4
          ? "Very good"
          : "Excellent!"}
      </Text>

      {/* Submit */}

      <TouchableOpacity
        style={[
          styles.submitRatingButton,
          selectedRating === 0 &&
            styles.submitRatingButtonDisabled,
        ]}
        disabled={selectedRating === 0}
        onPress={handleSubmitRating}
        activeOpacity={0.8}
      >
        <Text style={styles.submitRatingText}>
          Submit Rating
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color={color.white}
        />
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
};

export default RideDetailsScreen;

