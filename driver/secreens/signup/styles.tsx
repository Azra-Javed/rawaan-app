import { StyleSheet } from "react-native";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import fonts from "@/themes/app.fonts";

const styles = StyleSheet.create({
  // Screen
  screen: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  // Header
  header: {
    paddingTop: windowHeight(40),
    paddingHorizontal: windowWidth(20),
    paddingBottom: windowHeight(30),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  eyebrow: {
    fontFamily: fonts.medium,
    color: color.routeAmber,

    fontSize: 11,
    letterSpacing: 2,

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
    fontFamily: fonts.medium,

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

  // Scroll content
  scrollContent: {
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(22),
    paddingBottom: windowHeight(35),
  },

  // Form card
  formCard: {
    backgroundColor: color.white,

    borderRadius: 20,

    paddingHorizontal: windowWidth(18),
    paddingVertical: windowHeight(20),

    borderWidth: 1,
    borderColor: "#0F4C4A12",
  },

  // Progress
  progressContainer: {
    marginBottom: windowHeight(18),
  },

  // Form heading
  formHeader: {
    marginBottom: windowHeight(18),
  },

  // Field spacing
  fieldSpacing: {
    marginTop: windowHeight(8),
  },

  // Phone
  phoneSection: {
    marginTop: windowHeight(8),
  },

  fieldLabel: {
    fontFamily: fonts.medium,

    fontSize: windowWidth(14),

    color: "#172525",

    marginBottom: windowHeight(7),
  },

  phoneInput: {
    height: windowHeight(48),

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.white,

    borderWidth: 1,

    borderRadius: 14,

    overflow: "hidden",
  },

  countryCode: {
    height: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: windowWidth(11),

    borderRightWidth: 1,
    borderRightColor: "#DDE7E6",

    gap: windowWidth(7),
  },

  countryCodeText: {
    fontFamily: fonts.medium,

    fontSize: windowWidth(14),

    color: "#172525",
  },

  phoneTextInput: {
    flex: 1,

    height: "100%",

    paddingHorizontal: windowWidth(12),
    paddingVertical: 0,

    fontFamily: fonts.regular,

    fontSize: windowWidth(14),

    color: "#172525",
  },

  warning: {
    color: color.red,

    fontFamily: fonts.regular,

    fontSize: windowWidth(12),

    marginTop: windowHeight(4),
  },

  // Button
  buttonContainer: {
    marginTop: windowHeight(20),
  },

  // Footer
  footer: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: windowHeight(20),
    marginBottom: windowHeight(30),
  },

  footerLine: {
    height: 1,

    width: windowWidth(32),

    backgroundColor: "#0F4C4A18",
  },

  footerText: {
    fontFamily: fonts.regular,

    fontSize: 9,

    color: color.slateTeal,

    marginHorizontal: windowWidth(9),

    letterSpacing: 0.3,
  },
});

export default styles;
