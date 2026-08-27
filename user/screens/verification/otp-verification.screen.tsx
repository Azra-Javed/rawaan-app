import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import api from "@/api/client";
import { saveAuth } from "@/utils/authStorage";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-toast-notifications";

import Button from "@/components/common/button";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import ScreenHeader from "@/components/common/screen-header";
import color from "@/themes/app.colors";
import styles from "./styles";

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

      const response = await api.post(`/auth/verify-otp`, {
        email,
        otp: value,
      });

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
            token,
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
    <View style={styles.screen}>
      <ScreenHeader
        eyebrow="RAWAAN"
        title="OTP Verification"
        subtitle="Verify your account to continue"
        icon="shield-checkmark-outline"
      />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Enter verification code</Text>

            <Text style={styles.cardSubtitle}>We sent a 4-digit code to</Text>

            <Text style={styles.email}>{email}</Text>
          </View>

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoFocus={false}
            rootStyle={styles.codeField}
            renderCell={({ index, symbol, isFocused }) => (
              <View
                key={index}
                onLayout={getCellOnLayoutHandler(index)}
                style={[styles.otpCell, isFocused && styles.otpCellActive]}
              >
                <Text
                  style={[styles.otpText, isFocused && styles.otpTextActive]}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              </View>
            )}
          />

          {/* ================= VERIFY ================= */}

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? "Please wait..." : "Verify"}
              onPress={handleVerify}
              disabled={loading}
            />
          </View>

          {/* ================= RESEND ================= */}

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>

            <TouchableOpacity
              onPress={handleResend}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.resendButton, loading && styles.resendDisabled]}
              >
                Resend
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= FOOTER ================= */}

        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <View style={styles.footerIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={11}
              color={color.slateTeal}
            />
          </View>

          <Text style={styles.footerText}>Secure verification</Text>

          <View style={styles.footerLine} />
        </View>
      </View>
    </View>
  );
};

export default OtpVerificationScreen;
