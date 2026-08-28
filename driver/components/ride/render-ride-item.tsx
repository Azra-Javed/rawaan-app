import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import { useDriver } from "@/hooks/useDriver";
import { rideIcons } from "@/configs/constants";

export default function RenderRideItem({ item, colors }: any) {
  const { driver } = useDriver();
  const iconIndex = parseInt(item.id) - 1;
  const icon = rideIcons[iconIndex];

  return (
    <View style={styles.main}>
      <View
        style={[
          styles.card,
          {
            borderColor: color.ivoryLine,
            backgroundColor: color.white,
          },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.valueContainer}>
            <Text style={styles.data}>
              {item.title === "Total Earning"
                ? driver?.totalEarning + " Pkr"
                : item.title === "Complete Ride"
                  ? driver?.totalRides
                  : item.title === "Pending Ride"
                    ? driver?.pendingRides
                    : item.title === "Cancel Ride"
                      ? driver?.cancelRides
                      : 0}
            </Text>
          </View>

          <View style={styles.iconContain}>{icon}</View>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </View>

      <View style={styles.bottomBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginVertical: windowHeight(7),
    marginHorizontal: windowWidth(8),
  },

  card: {
    minHeight: windowHeight(90),
    width: "100%",

    paddingHorizontal: windowWidth(13),
    paddingVertical: windowHeight(12),

    borderWidth: 1,
    borderRadius: 17,

    overflow: "hidden",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  valueContainer: {
    flex: 1,
    paddingTop: windowHeight(2),
  },

  data: {
    color: color.nightIndigo,

    fontFamily: "TT-Octosquares-Medium",

    fontSize: fontSizes.FONT22,
  },

  iconContain: {
    width: windowWidth(38),
    height: windowWidth(38),

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#0F4C4A12",

    borderWidth: 1,
    borderColor: color.ivoryLine,
  },

  cardBottom: {
    marginTop: windowHeight(13),
  },

  title: {
    fontFamily: "TT-Octosquares-Medium",

    fontSize: windowHeight(12.5),

    color: color.slateTeal,
  },

  bottomBorder: {
    position: "absolute",

    bottom: 0,
    left: windowWidth(15),
    right: windowWidth(15),

    height: windowHeight(3),

    borderRadius: 10,

    backgroundColor: color.routeAmber,
  },
});
