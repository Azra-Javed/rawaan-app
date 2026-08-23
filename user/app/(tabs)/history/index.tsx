import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "@/screens/home/styles";
import color from "@/themes/app.colors";
import RideCard from "@/components/ride/ride.card";
import { windowHeight } from "@/themes/app.constant";
import api from "@/api/client";

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
