import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { windowHeight, windowWidth } from "@/themes/app.constant";
import RideCard from "@/components/ride/ride.card";
import api from "@/api/client";

// ---------------------------------------------------------------------------
// Design tokens — matched with Services screen
// ---------------------------------------------------------------------------
const palette = {
  nightIndigo: "#0F4C4A",
  nightIndigoLight: "#176B68",
  routeAmber: "#F5A524",
  slateTeal: "#5C6B73",
  ivory: "#FBF8F2",
  ivoryLine: "#0F4C4A14",
  white: "#FFFFFF",
};

const displayFont = "TT-Octosquares-Medium";

function RouteDots({
  color = palette.routeAmber,
  count = 6,
}: {
  color?: string;
  count?: number;
}) {
  return (
    <View style={styles.routeDotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.routeDot,
            {
              backgroundColor: color,
              opacity: 1 - (i / count) * 0.75,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function History() {
  const [recentRides, setrecentRides] = useState([]);

  useEffect(() => {
    const getRecentRides = async () => {
      const res = await api.get(`/user/get-rides`);
      setrecentRides(res.data.rides);
    };

    getRecentRides();
  }, []);

  return (
    <View style={styles.screen}>
      {/* ================= HEADER ================= */}

      <LinearGradient
        colors={[palette.nightIndigo, palette.nightIndigoLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Ambient glow */}
        <View style={styles.headerGlow} />

        <Text style={styles.eyebrow}>RAWAAN RIDES</Text>

        <View style={styles.headerTitleRow}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="time-outline"
              size={22}
              color={palette.routeAmber}
            />
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Ride History</Text>

            <Text style={styles.headerSubtitle}>
              View your previous rides and journeys
            </Text>
          </View>
        </View>

        <View style={styles.headerBottom}>
          <RouteDots />
        </View>
      </LinearGradient>

      {/* ================= CONTENT ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        {/* ================= SECTION HEADER ================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Previous rides</Text>

            <Text style={styles.sectionSubtitle}>
              Your completed ride history
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="car-outline"
              size={20}
              color={palette.nightIndigo}
            />
          </View>
        </View>

        {/* ================= RIDES ================= */}

        {recentRides?.length > 0 ? (
          <View style={styles.ridesContainer}>
            {recentRides.map((item: any, index: number) => (
              <View key={index} style={styles.rideWrapper}>
                <RideCard item={item} />
              </View>
            ))}
          </View>
        ) : (
          /* ================= EMPTY STATE ================= */

          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="car-outline"
                size={28}
                color={palette.nightIndigo}
              />
            </View>

            <Text style={styles.emptyTitle}>No rides yet</Text>

            <Text style={styles.emptySubtitle}>
              Your completed rides will appear here once you take your first
              ride.
            </Text>

            <View style={styles.emptyDots}>
              <RouteDots color={palette.ivoryLine} count={4} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ================= SCREEN =================

  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ================= HEADER =================

  header: {
    paddingTop: windowHeight(56),
    paddingBottom: windowHeight(26),
    paddingHorizontal: windowWidth(22),
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },

  headerGlow: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: palette.routeAmber,
    opacity: 0.14,
  },

  eyebrow: {
    color: palette.routeAmber,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginBottom: 9,
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
    fontFamily: displayFont,
    color: palette.white,
    fontSize: 25,
    lineHeight: 31,
  },

  headerSubtitle: {
    color: "#C7D8D6",
    fontSize: 13,
    marginTop: 4,
  },

  headerBottom: {
    marginTop: windowHeight(18),
  },

  // ================= ROUTE DOTS =================

  routeDotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  // ================= BODY =================

  body: {
    padding: windowWidth(20),
    paddingBottom: windowHeight(50),
  },

  // ================= SECTION =================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: windowHeight(15),
  },

  sectionTitle: {
    fontFamily: displayFont,
    fontSize: 18,
    color: palette.nightIndigo,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: palette.slateTeal,
    marginTop: 4,
    lineHeight: 19,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#0F4C4A12",
    alignItems: "center",
    justifyContent: "center",
  },

  // ================= RIDES =================

  ridesContainer: {
    gap: windowHeight(10),
  },

  rideWrapper: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.ivoryLine,
    overflow: "hidden",
  },

  // ================= EMPTY STATE =================

  emptyCard: {
    backgroundColor: palette.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.ivoryLine,
    alignItems: "center",
    paddingHorizontal: windowWidth(25),
    paddingVertical: windowHeight(42),
    marginTop: windowHeight(5),
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#0F4C4A12",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontFamily: displayFont,
    fontSize: 17,
    color: palette.nightIndigo,
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.slateTeal,
    textAlign: "center",
    maxWidth: windowWidth(285),
  },

  emptyDots: {
    marginTop: 18,
  },
});
