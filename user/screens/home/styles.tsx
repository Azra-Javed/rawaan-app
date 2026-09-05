import { StyleSheet } from "react-native";

import appFonts from "@/themes/app.fonts";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: windowHeight(50),
  },

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

  historyIcon: {
    width: windowWidth(36),
    height: windowWidth(36),
    borderRadius: 12,

    backgroundColor: color.tealLight,

    alignItems: "center",
    justifyContent: "center",
  },

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

  container: {
    flex: 1,
  },

  header: {
    paddingTop: windowHeight(18),
    paddingBottom: windowHeight(22),
    paddingHorizontal: windowWidth(20),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  eyebrow: {
    fontFamily: fonts.display,
    color: color.routeAmber,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: windowHeight(10),
  },

  headerTitle: {
    fontFamily: fonts.display,
    color: color.white,
    fontSize: 28,
    lineHeight: 34,
  },

  headerSubtitle: {
    color: "#D1DFDD",
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },

  // ================= SEARCH =================

  searchContainer: {
    marginTop: windowHeight(13),

    backgroundColor: color.white,

    borderRadius: 16,

    paddingHorizontal: windowWidth(5),
    paddingVertical: windowHeight(4),
  },

  // ================= BODY =================

  body: {
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(25),
    paddingBottom: windowHeight(50),
  },

  // ================= SECTION =================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: windowHeight(16),
  },

  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: color.nightIndigo,
  },

  sectionSubtitle: {
    fontSize: 12.5,
    color: color.slateTeal,

    marginTop: 4,

    lineHeight: 18,
  },

  sectionIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",
  },

  // ================= RIDES =================

  ridesContainer: {
    gap: windowHeight(10),
  },

 
  // ================= EMPTY STATE =================

  emptyCard: {
    backgroundColor: color.white,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: color.ivoryLine,

    alignItems: "center",

    paddingHorizontal: windowWidth(25),
    paddingVertical: windowHeight(42),

    marginTop: windowHeight(4),
  },

  emptyIcon: {
    width: windowWidth(60),
    height: windowWidth(60),
    borderRadius: 18,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: windowHeight(14),
  },

  emptyTitle: {
    fontFamily: fonts.display,

    fontSize: fontSizes.FONT17,

    color: color.nightIndigo,

    marginBottom: windowHeight(6),
  },

  emptySubtitle: {
    fontSize: fontSizes.FONT13,
    lineHeight: windowHeight(19),

    color: color.slateTeal,

    textAlign: "center",

    maxWidth: windowWidth(285),
  },
});

export default styles;
