import { StyleSheet } from "react-native";

import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";

export const styles = StyleSheet.create({
  container: {
    minHeight: windowHeight(70),

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.whiteColor,

    borderRadius: 16,

    paddingHorizontal: windowWidth(12),
  },

  searchIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",
  },

  destination: {
    flex: 1,

    marginLeft: windowWidth(11),
  },

  label: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT10,

    letterSpacing: 0.8,

    color: color.mutedText,
  },

  placeholder: {
    marginTop: windowHeight(3),

    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT14,

    color: color.primaryText,
  },

  timeButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.lightGray,

    borderRadius: 12,

    paddingHorizontal: windowWidth(10),
    paddingVertical: windowHeight(9),

    gap: windowWidth(4),
  },

  timeText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT12,

    color: color.primaryText,
  },
});
