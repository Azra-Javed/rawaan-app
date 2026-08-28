import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  // Teal header matching the login screen
  header: {
    paddingTop: windowHeight(55),
    paddingHorizontal: windowWidth(22),
    paddingBottom: windowHeight(24),

    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,

    overflow: "hidden",
  },

  eyebrow: {
    fontFamily: "TT-Octosquares-Medium",
    color: color.routeAmber,
    fontSize: 11,
    letterSpacing: 2.5,

    marginBottom: windowHeight(13),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: windowWidth(46),
    height: windowWidth(46),

    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: windowWidth(12),
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: "TT-Octosquares-Medium",
    color: color.white,
    fontSize: 23,
    lineHeight: 29,
  },

  headerSubtitle: {
    color: color.headerSubtitle,
    fontSize: 12.5,

    marginTop: 3,
    lineHeight: 18,
  },

  // Scrollable area below the fixed header
  scrollContent: {
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(22),
    paddingBottom: windowHeight(40),
  },

  // Main white form card
  formCard: {
    backgroundColor: color.white,

    borderRadius: 20,

    paddingHorizontal: windowWidth(18),
    paddingVertical: windowHeight(20),

    borderWidth: 1,
    borderColor: "#0F4C4A12",
  },

  progressContainer: {
    marginBottom: windowHeight(18),
  },

  formHeader: {
    marginBottom: windowHeight(18),
  },

  field: {
    width: "100%",
    marginBottom: windowHeight(4),
  },

  buttonContainer: {
    marginTop: windowHeight(10),
  },

  bottomInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: windowHeight(18),
    paddingHorizontal: windowWidth(10),
  },

  bottomIcon: {
    width: 30,
    height: 30,

    borderRadius: 10,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",

    marginRight: windowWidth(8),
    marginBottom: windowHeight(30),
  },

  bottomText: {
    fontSize: 10.5,
    color: color.slateTeal,
    marginBottom: windowHeight(30),
  },
});

export default styles;
