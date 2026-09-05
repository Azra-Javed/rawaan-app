
import { commonStyles } from "@/styles/common.style";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "@/api/client";
import LocationSearchBar from "@/components/location/location.search.bar";
import RideCard from "@/components/ride/ride.card";
import color from "@/themes/app.colors";
import styles from "./styles";
import { StatusBar } from "expo-status-bar";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  const [recentRides, setrecentRides] = useState([]);

  useEffect(() => {
    const getRecentRides = async () => {
      try {
        const res = await api.get(`/user/get-rides`);

        const rides = res.data.rides
          .filter(
            (ride: any) =>
              String(ride.status).toLowerCase() === "completed"
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

        setrecentRides(rides.slice(0, 3));
      } catch (error) {
        console.log("Failed to fetch recent rides:", error);
      }
    };
    getRecentRides();
  }, []);

  return (
    <>
    <StatusBar style="light" backgroundColor={color.tealDark} />
    <View
      style={[
        commonStyles.flexContainer,
        { backgroundColor: color.ivory },
      ]}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[color.nightIndigo, color.nightIndigoLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.header,
            {
              paddingTop: insets.top + 18,
            },
          ]}
        >
          <Text style={styles.eyebrow}>RAWAAN</Text>

          <Text style={styles.headerTitle}>Where to?</Text>

          <Text style={styles.headerSubtitle}>
            Find your destination and book a ride
          </Text>

          <View style={styles.searchContainer}>
            <LocationSearchBar />
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={commonStyles.body}
        >
          <View style={commonStyles.sectionHeader}>
            <View>
              <Text style={commonStyles.sectionTitle}>Recent rides</Text>

              <Text style={commonStyles.sectionSubtitle}>
                Your latest journeys
              </Text>
            </View>

            <View style={styles.sectionIcon}>
              <Ionicons
                name="time-outline"
                size={19}
                color={color.nightIndigo}
              />
            </View>
          </View>

          {recentRides?.length > 0 ? (
            <View style={commonStyles.ridesContainer}>
              {recentRides?.map((item: any, index: number) => (
                <View key={index}>
                  <RideCard item={item} />
                </View>
              ))}
            </View>
          ) : (
            <View style={commonStyles.emptyCard}>
              <View style={commonStyles.emptyIcon}>
                <Ionicons
                  name="car-outline"
                  size={27}
                  color={color.nightIndigo}
                />
              </View>

              <Text style={commonStyles.emptyTitle}>
                No recent rides
              </Text>

              <Text style={commonStyles.emptySubtitle}>
                Your recent journeys will appear here after you book your
                first ride.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
    </>
    
  );
};

export default HomeScreen;

