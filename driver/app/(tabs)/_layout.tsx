import { Home } from "@/assets/icons/home";
import { HomeLight } from "@/assets/icons/homeLight";
import { Person } from "@/assets/icons/person";
import { History } from "@/assets/icons/history";
import color from "@/themes/app.colors";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

const palette = {
  white: "#FFFFFF",
  muted: "#8F9A99",
  border: "#0F4C4A18",
};

const getTabIcon = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case "home":
      return focused ? (
        <Home colors={color.buttonBg} width={24} height={24} />
      ) : (
        <HomeLight />
      );

    case "rides/index":
      return <History color={focused ? color.buttonBg : palette.muted} />;

    case "profile/index":
      return <Person fill={focused ? color.buttonBg : palette.muted} />;

    default:
      return null;
  }
};

export default function TabLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={color.tealDark} />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,

          // Keep the icons centered inside their tab items
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIcon]}>
              {getTabIcon(route.name, focused)}
            </View>
          ),

          // Keep the tab bar above Android system navigation buttons
          tabBarStyle: styles.tabBar,

          tabBarItemStyle: styles.tabItem,

          tabBarHideOnKeyboard: true,
        })}
      >
        <Tabs.Screen name="home" />

        <Tabs.Screen name="rides/index" />

        <Tabs.Screen name="profile/index" />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 100,

    backgroundColor: palette.white,

    borderTopWidth: 1,
    borderTopColor: palette.border,

    // Android
    elevation: 0,

    // iOS
    shadowColor: "transparent",
    shadowOpacity: 0,

    paddingTop: 8,
    paddingBottom: 8,

    // Normal tab bar position
    position: "relative",
  },

  tabItem: {
    height: 52,

    justifyContent: "center",
    alignItems: "center",
  },

  iconWrapper: {
    width: 44,
    height: 40,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",
  },

  activeIcon: {
    backgroundColor: "#E7F2F1",
  },
});
