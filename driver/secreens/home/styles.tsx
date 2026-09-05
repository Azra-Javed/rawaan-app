import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Main screen
  spaceBelow: {
    paddingBottom: windowHeight(20),
  },

  headerWrapper: {
    overflow: "hidden",
  },
 

statsGrid: {
  width: "100%",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

emptyRide: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: windowHeight(24),
  paddingHorizontal: windowWidth(20),
  backgroundColor: color.white,
  borderRadius: 17,
  borderWidth: 1,
  borderColor: color.border,
},

emptyRideIcon: {
  width: windowWidth(44),
  height: windowWidth(44),
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: color.tealSoft,
  marginBottom: windowHeight(8),
},

emptyRideTitle: {
  fontFamily: "TT-Octosquares-Medium",
  fontSize: fontSizes.FONT14,
  color: color.textDark,
},

emptyRideText: {
  marginTop: windowHeight(3),
  fontFamily: "TT-Octosquares-Medium",
  fontSize: fontSizes.FONT10,
  color: color.textMuted,
  textAlign: "center",
},

  // Dashboard
  dashboardSection: {
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(22),
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: windowHeight(14),
  },

  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: color.nightIndigo,
  },

  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: color.slateTeal,
    marginTop: 4,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#0F4C4A12",
    alignItems: "center",
    justifyContent: "center",
  },

  columnWrapper: {
    justifyContent: "space-between",
  },

  // Recent rides
  rideContainer: {
    marginHorizontal: windowWidth(20),
    paddingTop: windowHeight(15),
    paddingBottom: windowHeight(12),
  },

  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: windowHeight(14),
  },

  rideTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: color.nightIndigo,
  },

  rideSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: color.slateTeal,
    marginTop: 4,
  },

  rideIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#0F4C4A12",
    alignItems: "center",
    justifyContent: "center",
  },

  // Modal
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: color.modelBg,
    paddingHorizontal: windowWidth(14),
  },

  modalContainer: {
    width: "100%",
    maxWidth: windowWidth(430),
    backgroundColor: color.white,
    borderRadius: 22,
    paddingHorizontal: windowWidth(17),
    paddingTop: windowHeight(17),
    paddingBottom: windowHeight(15),
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: windowHeight(13),
  },

  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0F4C4A12",
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(11),
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: color.nightIndigo,
  },

  modalSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: color.slateTeal,
    marginTop: 3,
    lineHeight: 16,
  },

  requestDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.routeAmber,
  },

  // Map
  mapWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },

  map: {
    width: "100%",
    height: windowHeight(205),
  },

  mapAttribution: {
    alignItems: "flex-end",
    marginTop: 3,
    marginBottom: 8,
  },

  attributionText: {
    fontFamily: fonts.regular,
    fontSize: 8,
    color: color.slateTeal,
  },

  // Locations
  locationContainer: {
    flexDirection: "row",
    backgroundColor: "#F7FAF9",
    borderRadius: 15,
    paddingHorizontal: windowWidth(11),
    paddingVertical: windowHeight(11),
    marginBottom: windowHeight(11),
  },

  leftView: {
    width: 28,
    alignItems: "center",
    justifyContent: "space-between",
  },

  locationIconBox: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "center",
  },

  verticaldot: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: "dashed",
    marginVertical: 3,
  },

  rightView: {
    flex: 1,
    marginLeft: windowWidth(9),
  },

  locationLabel: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    color: color.slateTeal,
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  pickup: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: color.nightIndigo,
    lineHeight: 17,
  },

  drop: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: color.nightIndigo,
    lineHeight: 17,
  },

  border: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: color.ivoryLine,
    marginVertical: 7,
  },

  // Distance and amount
  infoContainer: {
    flexDirection: "row",
    gap: windowWidth(9),
    marginBottom: windowHeight(13),
  },

  infoCard: {
    flex: 1,
    minHeight: windowHeight(52),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAF9",
    borderRadius: 14,
    paddingHorizontal: windowWidth(10),
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#0F4C4A12",
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(8),
  },

  infoIconAmber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F5A52418",
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(8),
  },

  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: color.slateTeal,
    marginBottom: 2,
  },

  infoValue: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: color.nightIndigo,
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: windowHeight(2),
  },
});

export default styles;
