import React from "react";
import { StyleSheet, View } from "react-native";

import color from "@/themes/app.colors";
import { windowWidth } from "@/themes/app.constant";

type Props = {
  colorValue?: string;
  count?: number;
};

export default function RouteDots({
  colorValue = color.amber,
  count = 6,
}: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: colorValue,
              opacity: 1 - (index / count) * 0.75,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: windowWidth(5),
    height: windowWidth(5),
    borderRadius: windowWidth(3),
    marginRight: windowWidth(5),
  },
});
