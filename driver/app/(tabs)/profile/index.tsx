import Button from "@/components/common/button";
import Input from "@/components/common/input";
import { useDriver } from "@/hooks/useDriver";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { clearAuth } from "@/utils/authStorage";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
export default function Profile() {
  const { driver, loading } = useDriver();

  if (loading) {
    return;
  }

  const handlePress = async () => {
    await clearAuth();
    router.push("/(routes)/login");
  };

  return (
    <View style={{ paddingTop: 70 }}>
      <Text
        style={{
          textAlign: "center",
          fontSize: fontSizes.FONT30,
          fontWeight: "600",
        }}
      >
        My Profile
      </Text>
      <View style={{ padding: windowWidth(20) }}>
        <Input
          title="Name"
          value={driver?.name}
          onChangeText={() => console.log("")}
          placeholder={driver?.name!}
        />
        <Input
          title="Email Address"
          value={driver?.email}
          onChangeText={() => console.log("")}
          placeholder={driver?.email!}
          disabled={true}
        />
        <Input
          title="Phone Number"
          value={driver?.phone_number}
          onChangeText={() => console.log("")}
          placeholder={driver?.phone_number!}
          disabled={true}
        />
        <View style={{ marginVertical: 25 }}>
          <Button
            onPress={async () => {
              handlePress();
            }}
            title="Log Out"
            height={windowHeight(35)}
            backgroundColor="crimson"
          />
        </View>
      </View>
    </View>
  );
}
