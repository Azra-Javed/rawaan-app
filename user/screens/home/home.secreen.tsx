import { commonStyles } from "@/styles/common.style";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";
import { external } from "@/styles/external.style";
import LocationSearchBar from "@/components/location/location.search.bar";

const HomeScreen = () => {
  return (
    <View style={[commonStyles.flexContainer, { backgroundColor: "#fff" }]}>
      <SafeAreaView style={styles.container}>
        <View style={[external.p_5, external.ph_20]}>
          <Text style={{ fontFamily: "TT-Octosquares-Medium", fontSize: 25 }}>
            Manzil App
          </Text>
          <LocationSearchBar />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
