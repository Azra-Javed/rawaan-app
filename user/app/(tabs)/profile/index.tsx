import Input from "@/components/common/input";
import { fontSizes, windowWidth } from "@/themes/app.constant";
import React from "react";
import { Text, View } from "react-native";

import Button from "@/components/common/button";

import { useUser } from "@/hooks/useUser";
import { clearAuth } from "@/utils/authStorage";
import { router } from "expo-router";

export default function Profile() {
  const { user, loading } = useUser();

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
          value={user?.name}
          onChangeText={() => console.log("")}
          placeholder={user?.name!}
        />
        <Input
          title="Email Address"
          value={user?.email}
          onChangeText={() => console.log("")}
          placeholder={user?.email!}
          disabled={true}
        />
        <Input
          title="Phone Number"
          value={user?.phone_number}
          onChangeText={() => console.log("")}
          placeholder={user?.phone_number!}
          disabled={true}
        />
        <View style={{ marginVertical: 25 }}>
          <Button
            onPress={() => handlePress()}
            title="Log Out"
            backgroundColor="crimson"
          />
        </View>
      </View>
    </View>
  );
}
