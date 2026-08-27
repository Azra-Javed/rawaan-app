import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  scrollContent: {
    paddingBottom: windowHeight(35),
  },

  header: {
    paddingTop: windowHeight(52),
    paddingBottom: windowHeight(28),
    paddingHorizontal: windowWidth(20),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    overflow: "hidden",
  },

  headerGlow: {
    position: "absolute",

    top: -80,
    right: -50,

    width: 200,
    height: 200,

    borderRadius: 100,

    backgroundColor: color.routeAmber,

    opacity: 0.13,
  },

  eyebrow: {
    fontFamily: fonts.display,

    color: color.routeAmber,

    fontSize: 11,

    letterSpacing: 2.2,

    marginBottom: windowHeight(13),
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 48,
    height: 48,

    borderRadius: 15,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: fonts.display,

    color: color.white,

    fontSize: 23,

    lineHeight: 30,
  },

  headerSubtitle: {
    color: "#D1DFDD",

    fontSize: 13,

    marginTop: 4,

    lineHeight: 19,
  },

  /* =========================================================
     ROUTE DOTS
  ========================================================= */

  routeDotsContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: windowHeight(19),
  },

  routeDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: color.routeAmber,

    marginRight: 8,
  },

  /* =========================================================
     FORM
  ========================================================= */

  formWrapper: {
    paddingHorizontal: windowWidth(20),

    marginTop: -2,
  },

  formCard: {
    backgroundColor: color.white,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: color.ivoryLine,

    paddingHorizontal: windowWidth(18),

    paddingTop: windowHeight(21),

    paddingBottom: windowHeight(18),
  },

  formHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: windowHeight(18),
  },

  formTitle: {
    fontFamily: fonts.display,

    fontSize: 18,

    color: color.nightIndigo,
  },

  formSubtitle: {
    fontSize: 12.5,

    color: color.slateTeal,

    marginTop: 4,

    lineHeight: 18,
  },

  formIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",
  },

  /* =========================================================
     INPUT SECTIONS
  ========================================================= */

  inputSection: {
    marginBottom: windowHeight(10),
  },

  /* =========================================================
     LABEL
  ========================================================= */

  label: {
    fontFamily: fonts.display,

    fontSize: 12,

    color: color.nightIndigo,

    marginBottom: windowHeight(7),
  },

  countrySection: {
    marginBottom: windowHeight(10),
  },

  selectWrapper: {
    borderRadius: 14,

    overflow: "hidden",
  },

  /* =========================================================
     VERIFIED EMAIL
  ========================================================= */

  verifiedRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 6,

    paddingLeft: 3,
  },

  verifiedText: {
    fontSize: 10.5,

    color: color.nightIndigoLight,

    marginLeft: 5,
  },

  /* =========================================================
     INFO
  ========================================================= */

  infoCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F4F8F7",

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#E0EBE9",

    paddingHorizontal: 11,

    paddingVertical: 10,

    marginTop: windowHeight(7),
  },

  infoIcon: {
    width: 30,
    height: 30,

    borderRadius: 9,

    backgroundColor: "#E4F0EE",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  infoText: {
    flex: 1,

    fontSize: 10.5,

    lineHeight: 15,

    color: color.slateTeal,
  },

  /* =========================================================
     BUTTON
  ========================================================= */

  buttonContainer: {
    marginTop: windowHeight(19),
  },

  /* =========================================================
     BOTTOM
  ========================================================= */

  bottomTextContainer: {
    alignItems: "center",

    marginTop: windowHeight(13),
  },

  bottomText: {
    fontSize: 10.5,

    color: "#8A9696",

    textAlign: "center",
  },
});

export default styles;
