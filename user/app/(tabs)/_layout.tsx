import { Person } from "@/assets/icons/person";
import color from "@/themes/app.colors";
import { Car, CarPrimary, Category, Home, HomeLight } from "@/utils/icons";
import { Tabs } from "expo-router";

const getTabIcon = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case "home":
      return focused ? (
        <Home colors={color.buttonBg} width={24} height={24} />
      ) : (
        <HomeLight />
      );

    case "services/index":
      return <Category colors={focused ? color.buttonBg : "#8F8F8F"} />;

    case "history/index":
      return focused ? <CarPrimary /> : <Car colors="#8F8F8F" />;

    case "profile/index":
      return <Person fill={focused ? color.buttonBg : "#8F8F8F"} />;

    default:
      return null;
  }
};

export default function _layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,

        tabBarIcon: ({ focused }) => getTabIcon(route.name, focused),
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="services/index" />
      <Tabs.Screen name="history/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}
