import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import RideCard from "@/components/ride/ride.card";
import color from "@/themes/app.colors";

import api from "@/api/client";
import { windowHeight } from "@/themes/app.constant";
import styles from "@/secreens/home/styles";

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
    <View
      style={[
        styles.rideContainer,
        { backgroundColor: color.lightGray, paddingTop: windowHeight(40) },
      ]}
    >
      <Text
        style={[
          styles.rideTitle,
          { color: color.primaryText, fontWeight: "600" },
        ]}
      >
        Ride History
      </Text>
      <ScrollView>
        {recentRides?.map((item: any, index: number) => (
          <RideCard item={item} key={index} />
        ))}
      </ScrollView>
    </View>
  );
}
