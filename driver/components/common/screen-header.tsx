import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import color from "@/themes/app.colors";
import { space, windowHeight, windowWidth } from "@/themes/app.constant";
import RouteDots from "./route-dots";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  children?: ReactNode;
  showDots?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  children,
  showDots = false,
  style,
}: Props) {
  return (
    <LinearGradient
      colors={[color.nightIndigo, color.nightIndigoLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, style]}
    >
      <View style={styles.glow} />

      <Text style={styles.eyebrow}>{eyebrow}</Text>

      <View style={styles.titleRow}>
        {icon && (
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={30} color={color.amber} />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {showDots && (
        <View style={styles.dots}>
          <RouteDots />
        </View>
      )}

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: windowHeight(45),
    paddingBottom: windowHeight(24),
    paddingHorizontal: windowWidth(22),

    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,

    overflow: "hidden",
  },

  glow: {
    position: "absolute",

    top: -60,
    right: -40,

    width: 180,
    height: 180,

    borderRadius: 90,

    backgroundColor: color.amber,
    opacity: 0.14,
  },

  eyebrow: {
    color: color.amber,

    fontSize: 11,
    fontWeight: "700",

    letterSpacing: 2.5,

    marginBottom: space.md,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: windowWidth(60),
    height: windowWidth(60),

    borderRadius: 15,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: windowWidth(13),

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontFamily: "TT-Octosquares-Medium",

    color: color.white,

    fontSize: 25,
    lineHeight: 31,
  },

  subtitle: {
    color: color.headerSubtitle,

    fontSize: 13,

    marginTop: space.xs,

    lineHeight: 19,
  },

  dots: {
    marginTop: windowHeight(10),
  },
});
