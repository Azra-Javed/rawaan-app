import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // ================= SCREEN =================

  screen: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  // ================= HEADER =================

  header: {
    paddingTop: windowHeight(70),
    paddingHorizontal: windowWidth(20),
    paddingBottom: windowHeight(32),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  eyebrow: {
    fontFamily: fonts.display,
    color: color.routeAmber,

    fontSize: 11,
    letterSpacing: 2,

    marginBottom: windowHeight(14),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: fonts.display,

    color: color.white,

    fontSize: 23,
    lineHeight: 29,
  },

  headerSubtitle: {
    color: "#D1DFDD",

    fontSize: 12.5,

    marginTop: 3,

    lineHeight: 18,
  },

  // ================= CONTENT =================

  content: {
    flex: 1,

    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(25),
  },

  // ================= CARD =================

  card: {
    backgroundColor: color.white,

    borderRadius: 20,

    paddingHorizontal: windowWidth(18),
    paddingVertical: windowHeight(23),

    borderWidth: 1,
    borderColor: color.border,
  },

  cardHeader: {
    marginBottom: windowHeight(23),
  },

  cardTitle: {
    fontFamily: fonts.display,

    fontSize: 19,

    color: color.nightIndigo,

    marginBottom: 6,
  },

  cardSubtitle: {
    fontSize: 12.5,

    lineHeight: 18,

    color: color.slateTeal,
  },

  email: {
    fontFamily: fonts.display,

    fontSize: 12,

    color: color.nightIndigo,

    marginTop: 4,
  },

  // ================= OTP =================

  codeField: {
    width: "100%",

    justifyContent: "space-between",
  },

  otpCell: {
    width: windowWidth(62),
    height: windowWidth(62),

    borderWidth: 1,
    borderColor: "#DDE6E5",

    borderRadius: 15,

    backgroundColor: "#F7F9F9",

    alignItems: "center",
    justifyContent: "center",
  },

  otpCellActive: {
    borderColor: color.nightIndigo,

    backgroundColor: color.lightTeal,
  },

  otpText: {
    fontFamily: fonts.display,

    fontSize: 23,

    color: "#172525",
  },

  otpTextActive: {
    color: color.nightIndigo,
  },

  // ================= BUTTON =================

  buttonContainer: {
    marginTop: windowHeight(22),
  },

  // ================= RESEND =================

  resendContainer: {
    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    marginTop: windowHeight(20),
  },

  resendText: {
    fontSize: 12,

    color: color.slateTeal,
  },

  resendButton: {
    fontFamily: fonts.display,

    fontSize: 12,

    color: color.nightIndigo,

    marginLeft: 5,
  },

  resendDisabled: {
    opacity: 0.45,
  },

  // ================= FOOTER =================

  footer: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: windowHeight(25),
  },

  footerLine: {
    width: 32,
    height: 1,

    backgroundColor: color.border,
  },

  footerIcon: {
    marginLeft: 9,
  },

  footerText: {
    fontSize: 9,

    color: color.slateTeal,

    marginHorizontal: 5,

    letterSpacing: 0.3,
  },
});

export default styles;
