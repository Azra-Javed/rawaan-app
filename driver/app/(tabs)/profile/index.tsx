
import ScreenHeader from "@/components/common/screen-header";
import { useDriver } from "@/hooks/useDriver";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { clearAuth } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { driver, loading } = useDriver();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.tealDark} />
      </View>
    );
  }

  const handleLogout = async () => {
    await clearAuth();
    router.push("/(routes)/login");
  };

  const initials =
    driver?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const isActive = driver?.status?.toLowerCase() === "active";

  return (
    <View style={styles.screen}>
      <StatusBar style="light" backgroundColor={color.tealDark} />
      <ScreenHeader
        eyebrow="ACCOUNT"
        title="Profile"
        subtitle="Driver account"
        icon="person-outline"
        showDots
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        {/* ================= DRIVER CARD ================= */}

        <View style={styles.driverCard}>
          <View style={styles.driverTop}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: isActive ? "#4C9A6A" : "#B77900",
                  },
                ]}
              />
            </View>

            <View style={styles.driverInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName}>
                  {driver?.name || "Driver"}
                </Text>

                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={color.tealDark}
                />
              </View>

              <Text style={styles.driverEmail}>
                {driver?.email || "No email"}
              </Text>

              <View style={styles.activeRow}>
               

                <Text
                  style={[
                    styles.activeText,
                    {
                      color: isActive ? "#357A4F" : "#A45B00",
                    },
                  ]}
                >
                  {driver?.status || "Unknown"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.vehicleStrip}>
            <View style={styles.vehicleIcon}>
              <Ionicons
                name="car-sport-outline"
                size={19}
                color={color.tealDark}
              />
            </View>

            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleType}>
                {driver?.vehicle_type || "Vehicle"}
              </Text>

              <Text style={styles.vehicleDetails}>
                {driver?.vehicle_color || "Unknown color"} •{" "}
                {driver?.registeration_number || "No registration"}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={color.textMuted}
            />
          </View>
        </View>

        {/* ================= STATS ================= */}

        <View style={styles.statsCard}>
          <StatItem
            icon="car-outline"
            value={String(driver?.totalRides ?? 0)}
            label="RIDES"
          />

          <View style={styles.statDivider} />

          <StatItem
            icon="cash-outline"
            value={`Rs. ${Number(
              driver?.totalEarning ?? 0
            ).toLocaleString()}`}
            label="EARNINGS"
          />

          <View style={styles.statDivider} />

          <StatItem
            icon="close-circle-outline"
            value={String(driver?.cancelRides ?? 0)}
            label="CANCELLED"
          />
        </View>

        {/* ================= DRIVER DETAILS ================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>DRIVER DETAILS</Text>
            <Text style={styles.sectionTitle}>Information</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="person-outline"
              size={18}
              color={color.tealDark}
            />
          </View>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow
            icon="call-outline"
            label="Phone"
            value={driver?.phone_number || "Not available"}
          />

          <DetailRow
            icon="card-outline"
            label="Driving license"
            value={driver?.driving_license || "Not available"}
          />

          <DetailRow
            icon="flag-outline"
            label="Country"
            value={driver?.country || "Pakistan"}
            last
          />
        </View>

        {/* ================= VEHICLE DETAILS ================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>VEHICLE</Text>
            <Text style={styles.sectionTitle}>Registered vehicle</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="car-outline"
              size={18}
              color={color.tealDark}
            />
          </View>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow
            icon="car-sport-outline"
            label="Type"
            value={driver?.vehicle_type || "Not available"}
          />

          <DetailRow
            icon="color-palette-outline"
            label="Color"
            value={driver?.vehicle_color || "Not available"}
          />

          <DetailRow
            icon="document-text-outline"
            label="Registration"
            value={driver?.registeration_number || "Not available"}
          />

          <DetailRow
            icon="calendar-outline"
            label="Registered"
            value={driver?.registeration_date || "Not available"}
            last
          />
        </View>

        {/* ================= RATING ================= */}

        <View style={styles.ratingCard}>
          <View style={styles.ratingIcon}>
            <Ionicons name="star" size={19} color="#B77900" />
          </View>

          <View style={styles.ratingContent}>
            <Text style={styles.ratingTitle}>Driver rating</Text>

            <Text style={styles.ratingSubtitle}>
              {driver?.ratings ?? 0} ratings received
            </Text>
          </View>

          <Text style={styles.ratingValue}>
            {driver?.ratings ?? 0}
          </Text>
        </View>

        {/* ================= LOGOUT ================= */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={color.coral}
          />

          <Text style={styles.logoutText}>Log out</Text>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={color.coral}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}


function StatItem({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={18} color={color.tealDark} />

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}



function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && styles.detailBorder,
      ]}
    >
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={17} color={color.tealDark} />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>

        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}


  //  STYLES


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.ivory,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: color.ivory,
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    paddingHorizontal: windowWidth(18),
    paddingTop: windowHeight(18),
    paddingBottom: windowHeight(40),
  },

  /* ================= DRIVER CARD ================= */

  driverCard: {
    backgroundColor: color.white,
    borderRadius: 22,
    padding: windowWidth(15),
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: windowHeight(12),
  },

  driverTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },

  avatar: {
    width: 61,
    height: 61,
    borderRadius: 19,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 21,
    fontWeight: "800",
    color: color.tealDark,
  },

  onlineDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    right: -1,
    bottom: -1,
    borderWidth: 2,
    borderColor: color.white,
  },

  driverInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  driverName: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textDark,
  },

  driverEmail: {
    fontSize: 11,
    color: color.textMuted,
    marginTop: 2,
  },

  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  activeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  vehicleStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },

  vehicleIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleType: {
    fontSize: 12,
    fontWeight: "800",
    color: color.textDark,
    textTransform: "capitalize",
  },

  vehicleDetails: {
    fontSize: 10,
    color: color.textMuted,
    marginTop: 2,
  },

  /* ================= STATS ================= */

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: color.white,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: windowHeight(24),
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 13,
    fontWeight: "800",
    color: color.textDark,
    marginTop: 5,
  },

  statLabel: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.textMuted,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: color.border,
  },

  /* ================= SECTION ================= */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 2,
  },

  sectionEyebrow: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: color.teal,
    marginBottom: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: color.textDark,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= DETAILS ================= */

  detailsCard: {
    backgroundColor: color.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: windowHeight(22),
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    paddingVertical: 9,
  },

  detailBorder: {
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: color.textMuted,
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    color: color.textDark,
  },

  /* ================= RATING ================= */

  ratingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E8",
    borderRadius: 17,
    padding: 13,
    marginBottom: windowHeight(12),
  },

  ratingIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#FFECC2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  ratingContent: {
    flex: 1,
  },

  ratingTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: color.textDark,
  },

  ratingSubtitle: {
    fontSize: 10,
    color: color.textMuted,
    marginTop: 2,
  },

  ratingValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#A66B00",
  },

  /* ================= LOGOUT ================= */

  logoutButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: "#F0D8D4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  logoutText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: color.coral,
    marginLeft: 10,
  },
});