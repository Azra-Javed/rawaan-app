import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // ==========================================================
  // SCREEN
  // ==========================================================

  screen: {
    flex: 1,
    backgroundColor: color.ivory,
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
    borderColor: color.border,

    elevation: 3,
  },

  mapStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.green,
    marginRight: 6,
  },

  mapStatusText: {
    fontSize: 9,
    fontWeight: "700",
    color: color.textDark,
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
    borderColor: color.border,
  },

  mapAttributionText: {
    fontSize: 7,
    color: color.textMuted,
  },

  // ==========================================================
  // CONTENT
  // ==========================================================

  contentContainer: {
    flex: 1,
    backgroundColor: color.ivory,
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

    backgroundColor: color.white,

    borderWidth: 1,
    borderColor: color.border,

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
    color: color.amber,
    marginBottom: 2,
  },

  planTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: color.textDark,
  },

  planSubtitle: {
    fontSize: 11,
    color: color.textMuted,
    marginTop: 2,
  },

  planIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: color.tealSoft,

    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // PICKUP TIME
  // ==========================================================

  pickupTimeCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: color.border,

    padding: windowWidth(11),

    marginBottom: windowHeight(11),

    elevation: 1,
  },

  pickupTimeIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,

    backgroundColor: color.amberSoft,

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
    color: color.textMuted,
    marginBottom: 2,
  },

  pickupTimeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: color.textDark,
  },

  // ==========================================================
  // LOCATION CARD
  // ==========================================================

  locationCard: {
    backgroundColor: color.white,

    borderRadius: 20,

    paddingHorizontal: windowWidth(13),

    paddingVertical: windowHeight(13),

    borderWidth: 1,
    borderColor: color.border,

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
    backgroundColor: color.tealSoft,
  },

  destinationLocationIcon: {
    backgroundColor: color.coralSoft,
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
    color: color.textMuted,
    marginBottom: 2,
  },

  currentLocationText: {
    fontSize: 13,
    fontWeight: "700",
    color: color.textDark,
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

    backgroundColor: color.tealSoft,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: color.borderTeal,

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

    backgroundColor: color.white,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 7,
  },

  tripInfoLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.textMuted,
  },

  tripInfoValue: {
    fontSize: 12,
    fontWeight: "800",
    color: color.tealDark,
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

    backgroundColor: color.white,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: color.border,

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
    backgroundColor: color.greenSoft,
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
    color: color.textDark,
  },

  connectionSubtitle: {
    fontSize: 9,
    color: color.textMuted,
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
    color: color.amber,
    marginBottom: 2,
  },

  optionsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: color.textDark,
  },

  optionsSubtitle: {
    fontSize: 10,
    color: color.textMuted,
    marginTop: 2,
  },

  optionsHeaderIcon: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: color.tealSoft,

    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // ROUTE SUMMARY
  // ==========================================================

  routeSummaryCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: color.border,

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

    backgroundColor: color.tealSoft,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 7,
  },

  routeSummaryLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,

    color: color.textMuted,
  },

  routeSummaryValue: {
    fontSize: 12,
    fontWeight: "800",

    color: color.textDark,

    marginTop: 2,
  },

  routeDivider: {
    width: 1,
    height: 29,

    backgroundColor: color.border,

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

    color: color.teal,

    marginBottom: 2,
  },

  vehicleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: color.textDark,
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.greenSoft,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 10,
  },

  availableDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: color.green,

    marginRight: 5,
  },

  availableText: {
    fontSize: 9,
    fontWeight: "700",
    color: color.green,
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

    backgroundColor: color.white,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: color.border,

    padding: windowWidth(10),

    minHeight: windowHeight(96),

    elevation: 1,
  },

  driverCardSelected: {
    borderWidth: 1.5,
    borderColor: color.teal,

    backgroundColor: "#F7FBFA",
  },

  selectedBadge: {
    position: "absolute",

    right: 8,
    top: 8,

    width: 23,
    height: 23,

    borderRadius: 8,

    backgroundColor: color.teal,

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
    backgroundColor: color.tealSoft,
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
    color: color.textDark,
    paddingRight: 15,
  },

  vehicleTypeBadge: {
    alignSelf: "flex-start",

    backgroundColor: color.tealSoft,

    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 7,

    marginTop: 4,
  },

  vehicleTypeText: {
    fontSize: 8,
    fontWeight: "800",
    color: color.tealDark,
    letterSpacing: 0.4,
  },

  driverPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: color.tealDark,
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
    color: color.textMuted,
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
    color: color.textMuted,
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

    backgroundColor: color.tealSoft,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: windowHeight(11),
  },

  loadingTitle: {
    fontSize: 16,
    fontWeight: "800",

    color: color.textDark,

    marginTop: windowHeight(10),
  },

  loadingSubtitle: {
    fontSize: 10.5,

    color: color.textMuted,

    textAlign: "center",

    marginTop: 4,
  },
});

export default styles;
