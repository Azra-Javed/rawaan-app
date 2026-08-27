import { commonStyles } from "@/styles/common.style";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import api from "@/api/client";
import LocationSearchBar from "@/components/location/location.search.bar";
import RideCard from "@/components/ride/ride.card";
import color from "@/themes/app.colors";
import styles from "./styles";

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
      style={[commonStyles.flexContainer, { backgroundColor: color.ivory }]}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[color.nightIndigo, color.nightIndigoLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
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
                <View key={index} style={commonStyles.rideWrapper}>
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

              <Text style={commonStyles.emptyTitle}>No recent rides</Text>

              <Text style={commonStyles.emptySubtitle}>
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
