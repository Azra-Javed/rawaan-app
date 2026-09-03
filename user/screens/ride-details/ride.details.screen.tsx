import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, Region, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import color from "@/themes/app.colors";
import { getRoute, type Coord } from "@/utils/osrm";
import { connectWebSocket, disconnectWebSocket } from "@/utils/websocket";

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
      console.log("Ride status WebSocket:", data);

      if (
        data.type === "rideStatusUpdated" &&
        data.rideId === orderData?.ride?.id
      ) {
        console.log(
          "Ride status changed to:",
          data.status
        );

        setOrderStatus(data.status);
      }
    });

    return () => {
      disconnectWebSocket();
    };
  }, [orderData?.ride?.id]);
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
            orderStatus === "Completed" && (<View style={styles.paymentSection}>
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
    </View>
  );
};

export default RideDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  mapContainer: {
    height: "48%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: color.nightIndigo,
  },

  map: {
    flex: 1,
  },

  mapBackButton: {
    position: "absolute",
    top: 18,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  attribution: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },

  attributionText: {
    fontSize: 7.5,
    color: color.muted,
  },

  routeLoading: {
    position: "absolute",
    bottom: 18,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 4,
  },

  routeLoadingText: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "600",
    color: color.nightIndigo,
  },

  detailsContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: color.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  detailsContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: color.border,
    marginBottom: 17,
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: color.buttonBg,
    marginBottom: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.tealSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#31A46C",
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
    color: color.nightIndigo,
  },

  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },

  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  driverInfo: {
    flex: 1,
  },

  driverLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  driverName: {
    fontSize: 16,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: color.nightIndigo,
    alignItems: "center",
    justifyContent: "center",
  },

  callButtonDisabled: {
    backgroundColor: color.border,
  },

  detailsCard: {
    backgroundColor: color.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 13,
    marginBottom: 14,
  },

  detailRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  detailText: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: color.nightIndigo,
  },

  phoneValue: {
    color: color.buttonBg,
  },

  actionText: {
    fontSize: 11,
    fontWeight: "800",
    color: color.buttonBg,
    paddingHorizontal: 5,
  },

  divider: {
    height: 1,
    backgroundColor: color.border,
    marginLeft: 46,
  },

  vehicleColor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.ivory,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
  },

  colorDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  vehicleColorText: {
    fontSize: 9,
    fontWeight: "600",
    color: color.muted,
    maxWidth: 55,
  },

  paymentSection: {
    backgroundColor: color.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: color.border,
    padding: 15,
    marginBottom: 12,
  },

  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  paymentTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.buttonBg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  paidText: {
    fontSize: 9,
    fontWeight: "800",
    color: color.white,
    marginLeft: 3,
  },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paymentLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  paymentAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  paymentCurrency: {
    fontSize: 11,
    fontWeight: "800",
    color: color.muted,
  },

  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.nightIndigo,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
  },

  payButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: color.white,
    marginRight: 7,
  },

  paymentSuccess: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },

  paymentSuccessText: {
    fontSize: 10,
    fontWeight: "600",
    color: color.muted,
    marginLeft: 6,
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  noteText: {
    fontSize: 9.5,
    color: color.muted,
    marginLeft: 5,
  },

  emptyScreen: {
    flex: 1,
    backgroundColor: color.ivory,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: color.nightIndigo,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 11,
    color: color.muted,
    textAlign: "center",
    marginTop: 6,
  },

  backButtonEmpty: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.nightIndigo,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 20,
  },

  backButtonText: {
    color: color.white,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,76,74,0.35)",
  },

  paymentModal: {
    backgroundColor: color.ivory,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 28,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: color.border,
    alignSelf: "center",
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  modalSubtitle: {
    fontSize: 10.5,
    color: color.muted,
    marginTop: 3,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },

  modalAmountBox: {
    backgroundColor: color.white,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },

  modalAmountLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.muted,
    marginBottom: 3,
  },

  modalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  modalCurrency: {
    fontSize: 11,
    color: color.muted,
  },

  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: color.border,
    padding: 12,
    marginBottom: 9,
  },

  paymentMethodSelected: {
    borderColor: color.buttonBg,
    backgroundColor: color.tealSoft,
  },

  paymentMethodIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  paymentMethodText: {
    flex: 1,
  },

  paymentMethodTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: color.nightIndigo,
  },

  paymentMethodSubtitle: {
    fontSize: 9.5,
    color: color.muted,
    marginTop: 2,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: color.buttonBg,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.buttonBg,
  },

  confirmPaymentButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: color.nightIndigo,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  confirmPaymentText: {
    color: color.white,
    fontSize: 12,
    fontWeight: "800",
    marginRight: 7,
  },
});