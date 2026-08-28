import { commonStyles } from "@/styles/common.style";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  // ================= HEADER =================

  header: {
    paddingTop: windowHeight(45),
    paddingHorizontal: 24,
    paddingBottom: windowHeight(30),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  eyebrow: {
    fontFamily: fonts.display,
    color: color.routeAmber,

    fontSize: 11,
    letterSpacing: 2,

    marginBottom: windowHeight(15),
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  title: {
    fontFamily: fonts.display,

    color: color.white,

    fontSize: 24,
    lineHeight: 30,
  },

  subtitle: {
    color: "#D1DFDD",

    fontSize: 12.5,

    marginTop: 3,

    lineHeight: 18,
  },

  // ================= CONTENT =================

  content: {
    flex: 1,

    paddingHorizontal: 20,
    paddingTop: windowHeight(28),
  },

  // ================= FORM =================

  formCard: {
    backgroundColor: color.white,

    borderRadius: 20,

    paddingHorizontal: 18,
    paddingVertical: 22,

    borderWidth: 1,
    borderColor: "#0F4C4A12",
  },

  formHeader: {
    marginBottom: windowHeight(22),
  },

  formTitle: {
    fontFamily: fonts.display,

    fontSize: 20,

    color: color.nightIndigo,

    marginBottom: 5,
  },

  formSubtitle: {
    fontSize: 12.5,

    lineHeight: 19,

    color: color.slateTeal,
  },

  // ================= INPUT =================

  inputContainer: {
    width: "100%",
  },

  // ================= BUTTON =================

  buttonContainer: {
    marginTop: windowHeight(20),
  },

  // ================= FOOTER =================

  footer: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: windowHeight(25),
  },
  signUpText: {
    ...commonStyles.mediumTextBlack12,
    fontFamily: fonts.bold,
    paddingHorizontal: windowHeight(4),
  },

  footerText: {
    fontSize: 9,

    color: color.slateTeal,

    marginHorizontal: 10,

    letterSpacing: 0.4,
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: windowHeight(18),
  },

  signupText: {
    fontFamily: fonts.regular,
    fontSize: 12,

    color: color.slateTeal,
  },

  signupLink: {
    fontFamily: fonts.medium,
    fontSize: 12,

    color: color.nightIndigo,

    marginLeft: windowWidth(5),
  },

  footerLine: {
    height: 1,
    width: windowWidth(35),

    backgroundColor: "#0F4C4A18",
  },
});

export default styles;
