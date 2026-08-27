import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { Search, Clock } from "@/utils/icons";
import DownArrow from "@/assets/icons/downArrow";

import { styles } from "./styles";

export default function LocationSearchBar() {
  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push("/(routes)/rideplan")}
    >
      <View style={styles.searchIcon}>
        <Search />
      </View>

      <View style={styles.destination}>
        <Text style={styles.label}>DESTINATION</Text>

        <Text style={styles.placeholder}>Where would you like to go?</Text>
      </View>

      <View style={styles.timeButton}>
        <Clock />

        <Text style={styles.timeText}>Now</Text>

        <DownArrow />
      </View>
    </Pressable>
  );
}
