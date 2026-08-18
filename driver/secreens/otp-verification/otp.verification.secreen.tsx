import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AuthContainer from "@/utils/container/auth.container";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/login/signin.text";
import Button from "@/components/common/button";
import { external } from "@/styles/external.style";
import { router, useLocalSearchParams } from "expo-router";
import color from "@/themes/app.colors";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { commonStyles } from "@/styles/common.style";
import { styles } from "./styles";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import api from "@/api/client";
import { saveAuth } from "@/utils/authStorage";

const CELL_COUNT = 4;

const OtpVerificationScreen = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  // Get email from Login screen
  const { email } = useLocalSearchParams<{ email: string }>();

  const ref = useBlurOnFulfill({
    value,
    cellCount: CELL_COUNT,
  });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const handleVerify = async () => {
    if (value.length !== CELL_COUNT) {
      toast.show("Please enter the 4-digit OTP", {
        type: "warning",
      });
      return;
    }

    if (!email) {
      toast.show("Email is missing", {
        type: "danger",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/auth/verify-otp`,
        {
          email,
          otp: value,
        },
      );

      console.log(response);
      const { isNewUser, token, user } = response.data;

      //save JWT + user securely
      await saveAuth(token, user);

      toast.show(response.data.message || "OTP verified successfully", {
        type: "success",
      });

      if (isNewUser) {
        router.replace({
          pathname: "/(routes)/registeration",
          params: {
            userId: user.id,
            email: user.email,
          },
        });
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      console.log("Verify OTP error:", error);
      console.log("Backend response:", error.response?.data);

      toast.show(error.response?.data?.message || "Invalid or expired OTP", {
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.show("Email is missing", {
        type: "danger",
      });
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URI}/auth/send-otp`, {
        email,
      });

      setValue("");

      toast.show("Verified Successfully!", {
        type: "success",
      });
    } catch (error: any) {
      toast.show(error.response?.data?.message || "Unable to resend OTP", {
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      showImage={true}
      container={
        <View>
          <SignInText
            title="OTP Verification"
            subtitle={`Enter the OTP sent to ${email}`}
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
            <Button
              title={loading ? "Please wait..." : "Verify"}
              onPress={handleVerify}
              disabled={loading}
            />
          </View>

          <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                {
                  flexDirection: "row",
                  gap: 5,
                  justifyContent: "center",
                },
              ]}
            >
              <Text style={commonStyles.regularText}>Not Received Yet?</Text>

              <TouchableOpacity onPress={handleResend} disabled={loading}>
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
