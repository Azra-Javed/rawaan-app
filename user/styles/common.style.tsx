import { StyleSheet } from "react-native";

import appFonts from "../themes/app.fonts";
import color from "../themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "../themes/app.constant";
import { external } from "./external.style";

const commonStyles = StyleSheet.create({
  regularText: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT15,
    color: color.regularText,
  },

  regularTextBigBlack: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT27,
    color: color.primaryText,
    fontWeight: "500",
  },

  mediumTextBlack: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT20,
    color: color.primaryText,
    fontWeight: "500",
  },

  extraBold: {
    fontFamily: appFonts.bold,
    fontSize: fontSizes.FONT19,
    color: color.whiteColor,
    fontWeight: "700",
  },

  mediumTextBlack12: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT16,
    color: color.primaryText,
  },

  mediumText23: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT23,
    color: color.primaryText,
    fontWeight: "500",
  },

  // Display font — reserved for hero moments (headers, empty states)
  displayTitle: {
    fontFamily: appFonts.display,
    fontSize: fontSizes.FONT23,
    color: color.title,
  },

  displayTitleLg: {
    fontFamily: appFonts.display,
    fontSize: fontSizes.FONT27,
    color: color.title,
  },

  flexContainer: {
    ...external.fx_1,
  },

  screen: {
    flex: 1,
    backgroundColor: color.background,
  },

  flexEndContainer: {
    backgroundColor: color.whiteColor,
  },

  appHeader: {
    backgroundColor: color.whiteColor,
    paddingHorizontal: windowWidth(22),
    paddingTop: windowHeight(16),
    paddingBottom: windowHeight(20),
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,

    shadowColor: color.blackColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  appHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  appHeaderIconBox: {
    width: windowWidth(50),
    height: windowWidth(50),
    borderRadius: 16,
    backgroundColor: color.tealLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth(13),

    borderWidth: 1,
    borderColor: color.linearBorder,
  },

  appHeaderEyebrow: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT11,
    letterSpacing: 1.6,
    color: color.amber,
    textTransform: "uppercase",
    marginBottom: 3,
  },

  appHeaderTitle: {
    fontFamily: appFonts.display,
    fontSize: fontSizes.FONT24,
    color: color.title,
  },

  appHeaderSubtitle: {
    marginTop: windowHeight(4),
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT13,
    color: color.mutedText,
  },

  appHeaderAccentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: windowHeight(16),
  },

  appHeaderAccentBar: {
    width: windowWidth(30),
    height: 3,
    borderRadius: 10,
    backgroundColor: color.amber,
    marginRight: windowWidth(8),
  },

  appHeaderAccentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.teal,
    opacity: 0.35,
    marginRight: 5,
  },

  homeHeader: {
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(18),
    paddingBottom: windowHeight(16),
  },

  greeting: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT14,
    color: color.mutedText,
  },

  homeTitle: {
    marginTop: windowHeight(3),
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT27,
    color: color.primaryText,
  },

  homeSubtitle: {
    marginTop: windowHeight(4),
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT14,
    color: color.regularText,
  },

  searchCard: {
    marginHorizontal: windowWidth(20),
    marginTop: windowHeight(4),

    backgroundColor: color.whiteColor,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: color.border,

    padding: windowWidth(6),

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: windowHeight(14),
  },

  sectionTitle: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT19,
    color: color.primaryText,
  },

  sectionSubtitle: {
    marginTop: windowHeight(3),
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT13,
    color: color.mutedText,
  },

  sectionAction: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT13,
    color: color.teal,
  },

  body: {
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(24),
    paddingBottom: windowHeight(40),
  },

  card: {
    backgroundColor: color.card,
    borderRadius: 18,

    borderWidth: 1,
    borderColor: color.border,
  },

  contentCard: {
    backgroundColor: color.card,
    borderRadius: 18,

    borderWidth: 1,
    borderColor: color.border,

    padding: windowWidth(16),
  },

  // Elevated variant — for hero / featured cards (profile summary, etc.)
  elevatedCard: {
    backgroundColor: color.card,
    borderRadius: 20,

    borderWidth: 1,
    borderColor: color.border,

    padding: windowWidth(18),

    shadowColor: color.blackColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxAmber: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: `${color.amber}22`,

    alignItems: "center",
    justifyContent: "center",
  },

  iconBoxLg: {
    width: 56,
    height: 56,
    borderRadius: 18,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: color.primary,

    borderRadius: 14,

    minHeight: windowHeight(50),

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: windowWidth(20),
  },

  primaryButtonText: {
    fontFamily: appFonts.semiBold,
    color: color.whiteColor,
    fontSize: fontSizes.FONT15,
  },

  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.primary,
    borderRadius: 999,
    paddingVertical: windowHeight(15),
    gap: windowWidth(8),

    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },

  pillButtonText: {
    fontFamily: appFonts.semiBold,
    color: color.whiteColor,
    fontSize: fontSizes.FONT15,
  },

  pillButtonOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1.4,
    borderColor: color.border,
    paddingVertical: windowHeight(15),
    gap: windowWidth(8),
  },

  pillButtonOutlineText: {
    fontFamily: appFonts.semiBold,
    color: color.regularText,
    fontSize: fontSizes.FONT15,
  },

  label: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT11,
    letterSpacing: 0.8,
    color: color.mutedText,
  },

  title: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT17,
    color: color.primaryText,
  },

  subtitle: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT13,
    lineHeight: 19,
    color: color.regularText,
  },

  ridesContainer: {
    gap: windowHeight(12),
  },

  rideWrapper: {
    backgroundColor: color.whiteColor,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: color.border,

    overflow: "hidden",
  },

  emptyCard: {
    backgroundColor: color.whiteColor,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: color.border,

    alignItems: "center",

    paddingHorizontal: windowWidth(25),
    paddingVertical: windowHeight(40),
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: windowHeight(14),
  },

  emptyTitle: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT17,
    color: color.primaryText,

    marginBottom: windowHeight(5),
  },

  emptySubtitle: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT13,
    lineHeight: 19,

    color: color.mutedText,

    textAlign: "center",

    maxWidth: windowWidth(285),
  },

  divider: {
    height: 1,
    backgroundColor: color.border,
  },

  dashedDivider: {
    borderStyle: "dashed",
    borderTopWidth: 1,
    borderColor: color.border,
  },

  chip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.tealLight,
    borderRadius: 999,
    paddingHorizontal: windowWidth(10),
    paddingVertical: windowHeight(5),
    gap: 5,
  },

  chipText: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT11,
    color: color.teal,
  },

  chipAmber: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${color.amber}22`,
    borderRadius: 999,
    paddingHorizontal: windowWidth(10),
    paddingVertical: windowHeight(5),
    gap: 5,
  },

  chipAmberText: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT11,
    color: "#B87A1E",
  },

  shadowContainer: {
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 2,
  },

  amberAccent: {
    backgroundColor: color.amber,
  },
});

export { commonStyles };
