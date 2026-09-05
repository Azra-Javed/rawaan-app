import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import RideCard from "@/components/ride/ride.card";
import color from "@/themes/app.colors";

import api from "@/api/client";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import RouteDots from "@/components/common/route-dots";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/common/screen-header";
import { StatusBar } from "expo-status-bar";

export default function Rides() {
  const [recentRides, setrecentRides] = useState([]);

  useEffect(() => {
    const getRecentRides = async () => {
      const res = await api.get(`/driver/get-rides`);
      setrecentRides(res.data.rides);
    };

    getRecentRides();
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar  style="light" backgroundColor={color.tealDark} />
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
            <Ionicons name="car-outline" size={20} color={color.nightIndigo} />
          </View>
        </View>

        {recentRides?.length > 0 ? (
          <View style={styles.ridesContainer}>
            {recentRides.map((item: any, index: number) => (
              <View key={index}>
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
                color={color.nightIndigo}
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
  );
}

const styles = StyleSheet.create({
  // ================= SCREEN =================

  screen: {
    flex: 1,
    backgroundColor: color.ivory,
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
    fontFamily: fonts.display,
    fontSize: 18,
    color: color.nightIndigo,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: color.slateTeal,
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
    fontFamily: fonts.display,
    fontSize: 17,
    color: color.nightIndigo,
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: color.slateTeal,
    textAlign: "center",
    maxWidth: windowWidth(285),
  },

  emptyDots: {
    marginTop: 18,
  },
});
