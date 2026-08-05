import React, { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import AuthContainer from "@/utils/container/auth.container";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/login/signin.text";
import Button from "@/components/common/button";
import { external } from "@/styles/external.style";
import { router } from "expo-router";
import color from "@/themes/app.colors";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { commonStyles } from "@/styles/common.style";
import { styles } from "./styles";

const CELL_COUNT = 4;

const OtpVerificationScreen = () => {
  const [value, setValue] = useState("");

  const ref = useBlurOnFulfill({
    value,
    cellCount: CELL_COUNT,
  });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const handleVerify = () => {
    if (value.length !== CELL_COUNT) {
      Alert.alert("Invalid OTP", "Please enter the complete OTP.");
      return;
    }

    console.log("OTP:", value);

    router.push("/(tabs)/home");
  };

  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      showImage={true}
      container={
        <View>
          <SignInText
            title="OTP Verification"
            subtitle="Check your phone number for the OTP."
          />

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoFocus={false}
            rootStyle={{
              marginTop: 25,
              justifyContent: "space-between",
            }}
            renderCell={({ index, symbol, isFocused }) => (
              <View
                key={index}
                onLayout={getCellOnLayoutHandler(index)}
                style={{
                  width: 55,
                  height: 55,
                  borderWidth: 1,
                  borderColor: isFocused ? color.activeColor : color.subtitle,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: color.title,
                    fontWeight: "600",
                  }}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              </View>
            )}
          />

          <View style={[external.mt_30]}>
            <Button title="Verify" onPress={handleVerify} />
          </View>
          <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                { flexDirection: "row", gap: 5, justifyContent: "center" },
              ]}
            >
              <Text style={commonStyles.regularText}>Not Recieved Yet?</Text>
              <TouchableOpacity>
                <Text style={[styles.signUpText, { color: "#000" }]}>
                  Resend it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
};

export default OtpVerificationScreen;
