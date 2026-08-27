import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  // ============================================================
  // MAP
  // ============================================================

  mapContainer: {
    height: windowHeight(390),
    position: "relative",
    overflow: "hidden",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapBackButton: {
    position: "absolute",
    top: windowHeight(18),
    left: windowWidth(18),

    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: color.white,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,

    elevation: 4,
  },

  mapLabel: {
    position: "absolute",

    top: windowHeight(18),
    right: windowWidth(18),

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.white,

    borderRadius: 14,

    paddingHorizontal: 12,
    paddingVertical: 9,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 3,
  },

  mapLabelText: {
    marginLeft: 6,

    fontFamily: "TT-Octosquares-Medium",
    fontSize: 11,

    color: color.nightIndigo,
  },

  attribution: {
    position: "absolute",

    bottom: 5,
    right: 5,

    backgroundColor: "rgba(255,255,255,0.88)",

    paddingHorizontal: 5,
    paddingVertical: 2,

    borderRadius: 3,
  },

  attributionText: {
    fontSize: 8,
    color: "#596666",
  },

  routeLoading: {
    position: "absolute",

    top: windowHeight(70),
    alignSelf: "center",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.white,

    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 3,
  },

  routeLoadingText: {
    marginLeft: 7,

    fontSize: fontSizes.FONT11,
    color: color.slateTeal,
  },

  // ============================================================
  // DETAILS
  // ============================================================

  detailsContainer: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  detailsContent: {
    flex: 1,

    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(17),
    paddingBottom: windowHeight(10),
  },

  // ============================================================
  // HEADER
  // ============================================================

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: windowHeight(14),
  },

  eyebrow: {
    fontFamily: fonts.display,

    color: color.routeAmber,

    fontSize: 9,

    letterSpacing: 1.8,

    marginBottom: 3,
  },

  title: {
    fontFamily: fonts.display,

    fontSize: 21,

    color: color.nightIndigo,
  },

  rideIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",
  },

  // ============================================================
  // DRIVER
  // ============================================================

  driverCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: color.ivoryLine,

    paddingHorizontal: 13,
    paddingVertical: 12,

    marginBottom: windowHeight(10),
  },

  driverIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: color.lightTeal,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  driverInfo: {
    flex: 1,
  },

  smallLabel: {
    fontFamily: fonts.display,

    fontSize: 8,

    letterSpacing: 1.1,

    color: color.slateTeal,

    marginBottom: 3,
  },

  driverName: {
    fontFamily: fonts.display,

    fontSize: 16,

    color: color.text,
  },

  callButton: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: color.nightIndigo,

    alignItems: "center",
    justifyContent: "center",
  },

  callButtonDisabled: {
    backgroundColor: "#E8EEEE",
  },

  // ============================================================
  // INFORMATION CARD
  // ============================================================

  infoCard: {
    backgroundColor: color.white,

    borderRadius: 17,

    borderWidth: 1,
    borderColor: color.ivoryLine,

    paddingHorizontal: 13,
    paddingVertical: 4,

    marginBottom: windowHeight(10),
  },

  infoRow: {
    minHeight: 52,

    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: fonts.display,

    fontSize: 8,

    letterSpacing: 1,

    color: color.slateTeal,

    marginBottom: 2,
  },

  infoValue: {
    fontFamily: fonts.display,

    fontSize: 13,

    color: color.text,
  },

  phoneValue: {
    color: color.nightIndigo,
  },

  divider: {
    height: 1,

    backgroundColor: "#EDF1F1",

    marginLeft: 44,
  },

  vehicleColorContainer: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 10,

    backgroundColor: color.softGray,
  },

  colorDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    marginRight: 5,
  },

  vehicleColorText: {
    fontFamily: fonts.display,

    fontSize: 9,

    color: color.slateTeal,

    maxWidth: 65,
  },

  // ============================================================
  // PAYMENT
  // ============================================================

  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: color.nightIndigo,

    borderRadius: 18,

    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  paymentLabel: {
    fontFamily: fonts.display,

    fontSize: 9,

    letterSpacing: 1.1,

    color: color.routeAmber,

    marginBottom: 4,
  },

  paymentHint: {
    fontSize: 10,

    lineHeight: 14,

    color: "#C7D8D6",

    maxWidth: windowWidth(190),
  },

  amountContainer: {
    alignItems: "flex-end",
  },

  amount: {
    fontFamily: fonts.display,

    fontSize: 20,

    color: color.white,
  },

  currency: {
    fontFamily: fonts.display,

    fontSize: 9,

    color: color.routeAmber,

    marginTop: 1,
  },

  // ============================================================
  // EMPTY
  // ============================================================

  emptyScreen: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: color.ivory,

    paddingHorizontal: windowWidth(25),
  },

  emptyLoadingIcon: {
    width: 64,
    height: 64,

    borderRadius: 20,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 15,
  },

  emptyScreenTitle: {
    fontFamily: fonts.display,

    fontSize: fontSizes.FONT16,

    color: color.nightIndigo,

    textAlign: "center",

    marginBottom: 16,
  },

  backButtonEmpty: {
    backgroundColor: color.nightIndigo,

    borderRadius: 13,

    paddingHorizontal: 22,
    paddingVertical: 11,
  },

  backButtonText: {
    fontFamily: fonts.display,

    fontSize: fontSizes.FONT13,

    color: color.white,
  },
});

export default styles;
