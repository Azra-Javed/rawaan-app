import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { windowHeight, windowWidth } from "@/themes/app.constant";

import Input from "@/components/common/input";

import { useUser } from "@/hooks/useUser";
import { clearAuth } from "@/utils/authStorage";
import { router } from "expo-router";

// ============================================================
// RAWAAN DESIGN TOKENS
// Same visual language as Support screen
// ============================================================

const palette = {
  tealDark: "#0F4C4A",
  teal: "#176B68",
  tealSoft: "#E7F2F1",

  amber: "#F5A524",

  ivory: "#FBF8F2",
  white: "#FFFFFF",

  textDark: "#172525",
  textMuted: "#7A8585",

  border: "#E4EAEA",

  coral: "#E85C4A",
};

export default function Profile() {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  const handleLogout = async () => {
    await clearAuth();
    router.replace("/(routes)/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tealDark} />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <LinearGradient
        colors={[palette.tealDark, palette.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative glow */}
        <View style={styles.headerGlow} />

        <View style={styles.headerTopRow}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="person-outline"
              size={22}
              color={palette.tealDark}
            />
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>RAWAAN ACCOUNT</Text>

            <Text style={styles.headerTitle}>Profile</Text>

            <Text style={styles.headerSubtitle}>
              Manage your account details
            </Text>
          </View>
        </View>

        {/* Small Rawaan route accent */}
        <View style={styles.routeAccent}>
          <View style={styles.routeDot} />
          <View style={styles.routeLine} />
          <View style={[styles.routeDot, styles.routeDotSmall]} />
        </View>
      </LinearGradient>

      {/* ======================================================
          BODY
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        {/* ====================================================
            USER SUMMARY
        ==================================================== */}

        <View style={styles.summaryCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.onlineDot} />
          </View>

          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryLabel}>SIGNED IN AS</Text>

            <Text style={styles.summaryName}>{user?.name || "User"}</Text>

            <Text style={styles.summaryEmail}>{user?.email}</Text>
          </View>

          <View style={styles.profileBadge}>
            <Ionicons name="checkmark" size={15} color={palette.tealDark} />
          </View>
        </View>

        {/* ====================================================
            ACCOUNT DETAILS
        ==================================================== */}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionEyebrow}>PERSONAL INFO</Text>

              <Text style={styles.sectionTitle}>Account details</Text>

              <Text style={styles.sectionSubtitle}>
                Your personal information
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Ionicons
                name="person-circle-outline"
                size={21}
                color={palette.tealDark}
              />
            </View>
          </View>

          <View style={styles.detailsCard}>
            <Input
              title="Name"
              value={user?.name}
              onChangeText={() => console.log("")}
              placeholder={user?.name!}
            />

            <Input
              title="Email Address"
              value={user?.email}
              onChangeText={() => console.log("")}
              placeholder={user?.email!}
              disabled={true}
            />

            <Input
              title="Phone Number"
              value={user?.phone_number}
              onChangeText={() => console.log("")}
              placeholder={user?.phone_number!}
              disabled={true}
            />
          </View>
        </View>

        {/* ====================================================
            ACCOUNT SECURITY / INFO
        ==================================================== */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={palette.tealDark}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your account is secure</Text>

            <Text style={styles.infoText}>
              Your account information is securely stored and protected.
            </Text>
          </View>
        </View>

        {/* ====================================================
            LOGOUT
        ==================================================== */}

        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={21} color={palette.coral} />
          </View>

          <View style={styles.logoutContent}>
            <Text style={styles.logoutTitle}>Log out</Text>

            <Text style={styles.logoutSubtitle}>
              Sign out of your account on this device.
            </Text>
          </View>

          <View style={styles.logoutArrow}>
            <Ionicons name="chevron-forward" size={18} color={palette.coral} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // SCREEN
  // ==========================================================

  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    paddingTop: windowHeight(52),
    paddingHorizontal: windowWidth(20),
    paddingBottom: windowHeight(22),
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },

  headerGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -55,
    top: -70,
    backgroundColor: palette.amber,
    opacity: 0.12,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerTextContainer: {
    flex: 1,
  },

  eyebrow: {
    color: palette.amber,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: palette.white,
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#D7E6E5",
    marginTop: 3,
  },

  // ==========================================================
  // ROUTE ACCENT
  // ==========================================================

  routeAccent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: windowHeight(18),
  },

  routeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.amber,
  },

  routeDotSmall: {
    width: 5,
    height: 5,
    opacity: 0.65,
  },

  routeLine: {
    width: 42,
    height: 2,
    backgroundColor: palette.amber,
    opacity: 0.45,
    marginHorizontal: 7,
  },

  // ==========================================================
  // BODY
  // ==========================================================

  body: {
    paddingHorizontal: windowWidth(18),
    paddingTop: windowHeight(22),
    paddingBottom: windowHeight(45),
  },

  // ==========================================================
  // SUMMARY CARD
  // ==========================================================

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: windowWidth(16),
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: windowHeight(28),
  },

  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: palette.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D5E8E6",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.tealDark,
  },

  onlineDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    right: -1,
    bottom: -1,
    backgroundColor: "#4C9A6A",
    borderWidth: 2,
    borderColor: palette.white,
  },

  summaryTextContainer: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: palette.textMuted,
    marginBottom: 3,
  },

  summaryName: {
    fontSize: 17,
    fontWeight: "800",
    color: palette.textDark,
  },

  summaryEmail: {
    fontSize: 12,
    color: palette.textMuted,
    marginTop: 3,
  },

  profileBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: palette.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  section: {
    marginBottom: windowHeight(20),
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: windowHeight(15),
  },

  sectionTitleContainer: {
    flex: 1,
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: palette.teal,
    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: palette.textDark,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: palette.textMuted,
    marginTop: 3,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: palette.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================================================
  // DETAILS
  // ==========================================================

  detailsCard: {
    backgroundColor: palette.white,
    borderRadius: 18,
    padding: windowWidth(15),
    borderWidth: 1,
    borderColor: palette.border,
  },

  // ==========================================================
  // SECURITY INFO
  // ==========================================================

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.tealSoft,
    borderRadius: 17,
    padding: windowWidth(14),
    marginBottom: windowHeight(20),
    borderWidth: 1,
    borderColor: "#D6E8E6",
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: palette.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.tealDark,
  },

  infoText: {
    fontSize: 11,
    color: palette.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },

  // ==========================================================
  // LOGOUT
  // ==========================================================

  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 18,
    padding: windowWidth(14),
    borderWidth: 1,
    borderColor: "#F0D8D4",
  },

  logoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FDECEA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  logoutContent: {
    flex: 1,
  },

  logoutTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.textDark,
  },

  logoutSubtitle: {
    fontSize: 10,
    color: palette.textMuted,
    marginTop: 3,
    lineHeight: 15,
  },

  logoutArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FDECEA",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
