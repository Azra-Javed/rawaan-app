import { View, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

interface Props {
  fill: number;
}

const ProgressBar = ({ fill }: Props) => {
  const bars = Array(2).fill(0);
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={styles.container}>
        {bars.map((_, index) => (
          <View
            key={index}
            style={index < fill ? styles.filledBar : styles.emptyBar}
          />
        ))}
      </View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: windowWidth(4),
    marginVertical: windowHeight(7),

    gap: windowWidth(6),
  },

  filledBar: {
    flex: 1,

    height: windowHeight(4),

    backgroundColor: color.primary,

    borderRadius: 10,
  },

  emptyBar: {
    flex: 1,

    height: windowHeight(4),

    backgroundColor: color.graySoft,

    borderRadius: 10,
  },
});
