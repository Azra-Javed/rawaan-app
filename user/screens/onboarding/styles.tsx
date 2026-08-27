import color from "@/themes/app.colors";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // ================= CONTAINER =================

  container: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  // ================= SLIDE =================

  slideContainer: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  // ================= IMAGE =================

  imageContainer: {
    flex: 0.62,

    overflow: "hidden",

    backgroundColor: "#E7F2F1",

    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  // ================= BRAND =================

  brand: {
    position: "absolute",

    top: 55,
    left: 22,

    paddingHorizontal: 13,
    paddingVertical: 8,

    borderRadius: 11,

    backgroundColor: "rgba(15,76,74,0.90)",
  },

  brandText: {
    fontFamily: fonts.display,

    fontSize: 10,

    letterSpacing: 1.8,

    color: color.routeAmber,
  },

  // ================= INFORMATION =================

  infoContainer: {
    flex: 0.38,

    paddingHorizontal: 24,
    paddingTop: 24,

    backgroundColor: color.ivory,
  },

  accentLine: {
    width: 35,
    height: 4,

    borderRadius: 2,

    backgroundColor: color.routeAmber,

    marginBottom: 13,
  },

  title: {
    fontFamily: fonts.display,

    fontSize: 24,
    lineHeight: 31,

    color: color.nightIndigo,

    maxWidth: 330,
  },

  description: {
    fontSize: 13,

    lineHeight: 20,

    color: color.slateTeal,

    marginTop: 8,

    maxWidth: 340,
  },

  // ================= BUTTON =================

  button: {
    height: 52,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: color.nightIndigo,

    borderRadius: 15,

    paddingLeft: 18,
    paddingRight: 6,

    marginTop: 18,

    width: "100%",
  },

  buttonText: {
    fontFamily: fonts.display,

    fontSize: 13,

    color: color.white,
  },

  arrowContainer: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: color.nightIndigoLight,

    alignItems: "center",
    justifyContent: "center",

    transform: [{ rotate: "180deg" }],
  },

  // ================= PAGINATION =================

  pagination: {
    bottom: 18,

    right: 24,
    left: undefined,

    justifyContent: "flex-end",
  },

  activeDot: {
    width: 20,
    height: 5,

    borderRadius: 3,

    backgroundColor: color.routeAmber,

    marginHorizontal: 3,
  },

  dot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#B8C8C6",

    marginHorizontal: 3,
  },
});

export default styles;
