import { Person } from "@/assets/icons/person";
import color from "@/themes/app.colors";
import { Car, CarPrimary, Category, Home, HomeLight } from "@/utils/icons";
import { Tabs } from "expo-router";
import { StatusBar, StyleSheet, View } from "react-native";

const palette = {
  nightIndigo: "#0F4C4A",
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

    case "services/index":
      return <Category colors={focused ? color.buttonBg : palette.muted} />;

    case "history/index":
      return focused ? <CarPrimary /> : <Car colors={palette.muted} />;

    case "profile/index":
      return <Person fill={focused ? color.buttonBg : palette.muted} />;

    default:
      return null;
  }
};

export default function _layout() {
  return (
    <>
    
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,

          // Keep icon positions exactly as normal tab navigation
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activeIcon]}>
              {getTabIcon(route.name, focused)}
            </View>
          ),

          // Move the bar above the Android navigation buttons
          tabBarStyle: styles.tabBar,

          tabBarItemStyle: styles.tabItem,

          tabBarHideOnKeyboard: true,
        })}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="services/index" />
        <Tabs.Screen name="history/index" />
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

    // Important: gives the bar breathing room above
    paddingTop: 8,
    paddingBottom: 8,

    // Keeps it as a normal tab bar above system navigation
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
