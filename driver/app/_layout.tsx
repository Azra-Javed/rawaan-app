import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { LogBox } from "react-native";
import { useFonts } from "expo-font";
import React from "react";
import color from "@/themes/app.colors";
import { StatusBar } from "expo-status-bar";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "TT-Octosquares-Medium": require("../assets/fonts/TT-Octosquares-Medium.ttf"),
  });

  useEffect(() => {
    //hide warnings
    LogBox.ignoreAllLogs(true);
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
      animationDuration={250}
      offsetTop={50}
      swipeEnabled={true}
      successColor="#16A36A"
      dangerColor="#E53935"
      warningColor="#F59E0B"
      normalColor="#2878D4"
      textStyle={{
        fontSize: 14,
        fontWeight: "600",
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <StatusBar style="light" backgroundColor={color.tealDark} />
        <Stack.Screen name="index" />
      </Stack>
    </ToastProvider>
  );
}
