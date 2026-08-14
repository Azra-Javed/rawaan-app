import { View, Text } from "react-native";
import React from "react";
import { useUser } from "@/hooks/useUser";

export default function _layout() {
  const { loading, user } = useUser();
  console.log(loading, user);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{user?.name}</Text>
    </View>
  );
}
