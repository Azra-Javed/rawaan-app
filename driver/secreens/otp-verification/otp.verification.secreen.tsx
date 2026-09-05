import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import api from "@/api/client";
import ScreenHeader from "@/components/common/screen-header";
import { saveAuth } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import styles from "./styles";
import { StatusBar } from "expo-status-bar";

const CELL_COUNT = 4;

const OtpVerificationScreen = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const { email, type } = useLocalSearchParams<{
    email: string;
    type: "login" | "registration";
  }>();

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

      // =========================
      // REGISTRATION
      // =========================
      if (type === "registration") {
        const response = await api.post("/driver/auth/registeration", {
          email,
          otp: value,
        });

        toast.show(response.data.message || "Registration successful!", {
          type: "success",
        });

        router.replace("/(routes)/login");

        return;
      }

      // =========================
      // LOGIN
      // =========================

      console.log(value);
      const response = await api.post(`/driver/auth/verify-otp`, {
        email,
        otp: value,
      });

      console.log(response);
      const { token, driver } = response.data;

      // Save authentication information ONLY after login
      await saveAuth(token, driver);

      toast.show(response.data.message || "Login successful!", {
        type: "success",
      });

      router.replace("/(tabs)/home");
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

      // Registration and login may use different endpoints
      if (type === "registration") {
        await api.post("/driver/auth/registeration-otp", {
          email,
        });
      } else {
        await api.post("/driver/auth/send-otp", {
          email,
        });
      }

      setValue("");

      toast.show("OTP sent successfully!", {
        type: "success",
      });
    } catch (error: any) {
      console.log("Resend OTP error:", error);
      console.log("Backend response:", error.response?.data);

      toast.show(error.response?.data?.message || "Unable to resend OTP", {
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar  style="light" backgroundColor={color.tealDark} />
      <ScreenHeader
        eyebrow="RAWAAN"
        title="OTP Verification"
        subtitle="Verify your account to continue"
        icon="shield-checkmark-outline"
        showDots
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
