import { commonStyles } from "@/styles/common.style";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import { external } from "@/styles/external.style";
import LocationSearchBar from "@/components/location/location.search.bar";
import api from "@/api/client";
import color from "@/themes/app.colors";
import RideCard from "@/components/ride/ride.card";

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
    <View style={[commonStyles.flexContainer, { backgroundColor: "#fff" }]}>
      <SafeAreaView style={styles.container}>
        <View style={[external.p_5, external.ph_20]}>
          <Text style={{ fontFamily: "TT-Octosquares-Medium", fontSize: 25 }}>
            Manzil App
          </Text>
          <LocationSearchBar />
        </View>

        <View style={{ padding: 5 }}>
          <View
            style={[
              styles.rideContainer,
              { backgroundColor: color.whiteColor },
            ]}
          >
            <Text style={[styles.rideTitle, { color: color.regularText }]}>
              Recent Rides
            </Text>
            <ScrollView>
              {recentRides?.map((item: any, index: number) => (
                <RideCard item={item} key={index} />
              ))}
              {recentRides?.length === 0 && (
                <Text style={{ fontSize: 16 }}>
                  You don't have any ride history yet!
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
