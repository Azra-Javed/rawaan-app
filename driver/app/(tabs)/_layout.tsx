import { Home } from "@/assets/icons/home";
import { HomeLight } from "@/assets/icons/homeLight";
import { Person } from "@/assets/icons/person";
import { History } from "@/assets/icons/history";
import color from "@/themes/app.colors";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Home colors={color.buttonBg} width={24} height={24} />
            ) : (
              <HomeLight />
            ),
        }}
      />

      <Tabs.Screen
        name="rides/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <History color={focused ? color.buttonBg : "#8F8F8F"} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Person fill={focused ? color.buttonBg : "#8F8F8F"} />
          ),
        }}
      />
    </Tabs>
  );
}
