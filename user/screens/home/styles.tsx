import { StyleSheet } from "react-native";

import appFonts from "@/themes/app.fonts";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: windowHeight(50),
  },

  // =========================================================
  // TOP / HEADER
  // =========================================================

  topSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    backgroundColor: color.whiteColor,

    paddingHorizontal: windowWidth(22),
    paddingTop: windowHeight(16),
    paddingBottom: windowHeight(24),

    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,

    shadowColor: color.blackColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  greeting: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: color.amber,
    marginBottom: windowHeight(6),
  },

  title: {
    fontFamily: appFonts.display,
    fontSize: fontSizes.FONT26,
    color: color.title,
    maxWidth: windowWidth(280),
  },

  subtitle: {
    marginTop: windowHeight(6),
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT13,
    lineHeight: windowHeight(19),
    color: color.mutedText,
    maxWidth: windowWidth(260),
  },

  profileButton: {
    width: windowWidth(46),
    height: windowWidth(46),
    borderRadius: 15,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: color.linearBorder,
  },

  // =========================================================
  // SEARCH
  // =========================================================

  searchWrapper: {
    marginHorizontal: windowWidth(20),
    marginTop: windowHeight(-22),

    backgroundColor: color.whiteColor,
    borderRadius: 20,

    padding: windowWidth(6),

    borderWidth: 1,
    borderColor: color.border,

    shadowColor: color.blackColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 6,
  },

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  quickRow: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.whiteColor,

    marginHorizontal: windowWidth(20),
    marginTop: windowHeight(16),

    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.border,

    paddingVertical: windowHeight(6),
  },

  quickItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: windowHeight(12),
    gap: windowHeight(8),
  },

  quickIcon: {
    width: windowWidth(38),
    height: windowWidth(38),
    borderRadius: 13,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",
  },

  quickText: {
    fontFamily: appFonts.medium,
    fontSize: fontSizes.FONT12,
    color: color.regularText,
    textAlign: "center",
  },

  quickDivider: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: windowHeight(14),
    backgroundColor: color.border,
  },

  // =========================================================
  // SECTION HEADER
  // =========================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginHorizontal: windowWidth(20),
    marginTop: windowHeight(30),
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

  historyIcon: {
    width: windowWidth(36),
    height: windowWidth(36),
    borderRadius: 12,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",
  },

  // =========================================================
  // RIDES
  // =========================================================

  ridesContainer: {
    paddingHorizontal: windowWidth(20),
    gap: windowHeight(12),
  },

  // =========================================================
  // LOADING
  // =========================================================

  loadingCard: {
    marginHorizontal: windowWidth(20),

    backgroundColor: color.whiteColor,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.border,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: windowWidth(10),

    paddingVertical: windowHeight(30),
  },

  loadingText: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT13,
    color: color.mutedText,
  },

  // =========================================================
  // EMPTY STATE
  // =========================================================

  emptyCard: {
    marginHorizontal: windowWidth(20),

    backgroundColor: color.whiteColor,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.border,

    alignItems: "center",

    paddingHorizontal: windowWidth(28),
    paddingVertical: windowHeight(42),
  },

  emptyIcon: {
    width: windowWidth(60),
    height: windowWidth(60),
    borderRadius: 20,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: windowHeight(16),
  },

  emptyTitle: {
    fontFamily: appFonts.semiBold,
    fontSize: fontSizes.FONT17,
    color: color.primaryText,
    marginBottom: windowHeight(6),
  },

  emptySubtitle: {
    fontFamily: appFonts.regular,
    fontSize: fontSizes.FONT13,
    lineHeight: windowHeight(19),
    color: color.mutedText,
    textAlign: "center",
    maxWidth: windowWidth(280),
  },
});

export default styles;
