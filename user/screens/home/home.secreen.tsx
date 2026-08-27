import { commonStyles } from "@/styles/common.style";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api from "@/api/client";
import LocationSearchBar from "@/components/location/location.search.bar";
import RideCard from "@/components/ride/ride.card";
import { windowHeight, windowWidth } from "@/themes/app.constant";

// ---------------------------------------------------------------------------
// Design tokens — matched with Services + History
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

const HomeScreen = () => {
  const [recentRides, setrecentRides] = useState([]);

  useEffect(() => {
    const getRecentRides = async () => {
      const res = await api.get(`/user/get-rides`);
      setrecentRides(res.data.rides);
    };

    getRecentRides();
  }, []);

  return (
    <View
      style={[commonStyles.flexContainer, { backgroundColor: palette.ivory }]}
    >
      <SafeAreaView style={localStyles.container}>
        {/* ================= HEADER ================= */}

        <LinearGradient
          colors={[palette.nightIndigo, palette.nightIndigoLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={localStyles.header}
        >
          <Text style={localStyles.eyebrow}>RAWAAN</Text>

          <Text style={localStyles.headerTitle}>Where to?</Text>

          <Text style={localStyles.headerSubtitle}>
            Find your destination and book a ride
          </Text>

          {/* ================= SEARCH ================= */}

          <View style={localStyles.searchContainer}>
            <LocationSearchBar />
          </View>
        </LinearGradient>

        {/* ================= RECENT RIDES ================= */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={localStyles.body}
        >
          <View style={localStyles.sectionHeader}>
            <View>
              <Text style={localStyles.sectionTitle}>Recent rides</Text>

              <Text style={localStyles.sectionSubtitle}>
                Your latest journeys
              </Text>
            </View>

            <View style={localStyles.sectionIcon}>
              <Ionicons
                name="time-outline"
                size={19}
                color={palette.nightIndigo}
              />
            </View>
          </View>

          {recentRides?.length > 0 ? (
            <View style={localStyles.ridesContainer}>
              {recentRides?.map((item: any, index: number) => (
                <View key={index} style={localStyles.rideWrapper}>
                  <RideCard item={item} />
                </View>
              ))}
            </View>
          ) : (
            <View style={localStyles.emptyCard}>
              <View style={localStyles.emptyIcon}>
                <Ionicons
                  name="car-outline"
                  size={27}
                  color={palette.nightIndigo}
                />
              </View>

              <Text style={localStyles.emptyTitle}>No recent rides</Text>

              <Text style={localStyles.emptySubtitle}>
                Your recent journeys will appear here after you book your first
                ride.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;

const localStyles = StyleSheet.create({
  // ================= CONTAINER =================

  container: {
    flex: 1,
  },

  // ================= HEADER =================

  header: {
    paddingTop: windowHeight(18),
    paddingBottom: windowHeight(22),
    paddingHorizontal: windowWidth(20),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  eyebrow: {
    fontFamily: displayFont,
    color: palette.routeAmber,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: windowHeight(13),
  },

  headerTitle: {
    fontFamily: displayFont,
    color: palette.white,
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
    marginTop: windowHeight(18),

    backgroundColor: palette.white,

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
    fontFamily: displayFont,
    fontSize: 19,
    color: palette.nightIndigo,
  },

  sectionSubtitle: {
    fontSize: 12.5,
    color: palette.slateTeal,

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

    marginTop: windowHeight(4),
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
});
