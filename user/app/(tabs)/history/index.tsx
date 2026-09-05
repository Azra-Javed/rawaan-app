import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { windowHeight, windowWidth } from "@/themes/app.constant";
import RideCard from "@/components/ride/ride.card";
import ScreenHeader from "@/components/common/screen-header";
import RouteDots from "@/components/common/route-dots";
import api from "@/api/client";
import color from "@/themes/app.colors";
import { StatusBar } from "expo-status-bar";

const displayFont = "TT-Octosquares-Medium";
const palette = color;

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
    <>
      <StatusBar style="light" backgroundColor={color.tealDark} />
      <View style={styles.screen}>
        <ScreenHeader
          eyebrow="RAWAAN RIDES"
          title="Ride History"
          subtitle="View your previous rides and journeys"
          icon="time-outline"
          showDots
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
        >
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

          {recentRides?.length > 0 ? (
            <View style={styles.ridesContainer}>
              {recentRides.map((item: any, index: number) => (
                <View key={index} >
                  <RideCard item={item} />
                </View>
              ))}
            </View>
          ) : (
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
                <RouteDots colorValue={color.ivoryLine} count={4} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // ================= SCREEN =================

  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

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
