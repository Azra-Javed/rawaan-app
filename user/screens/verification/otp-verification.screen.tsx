import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import api from "@/api/client";
import { saveAuth } from "@/utils/authStorage";

import Button from "@/components/common/button";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { windowHeight, windowWidth } from "@/themes/app.constant";
import { commonStyles } from "@/styles/common.style";

const CELL_COUNT = 4;

const palette = {
  nightIndigo: "#0F4C4A",
  nightIndigoLight: "#176B68",
  routeAmber: "#F5A524",
  slateTeal: "#5C6B73",
  ivory: "#FBF8F2",
  white: "#FFFFFF",
  border: "#0F4C4A18",
  lightTeal: "#E7F2F1",
};

const displayFont = "TT-Octosquares-Medium";

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
    <View style={localStyles.screen}>
      {/* ================= HEADER ================= */}

      <LinearGradient
        colors={[palette.nightIndigo, palette.nightIndigoLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.header}
      >
        <Text style={localStyles.eyebrow}>RAWAAN</Text>

        <View style={localStyles.headerRow}>
          <View style={localStyles.headerIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={palette.routeAmber}
            />
          </View>

          <View style={localStyles.headerText}>
            <Text style={localStyles.headerTitle}>OTP Verification</Text>

            <Text style={localStyles.headerSubtitle}>
              Verify your account to continue
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ================= CONTENT ================= */}

      <View style={localStyles.content}>
        <View style={localStyles.card}>
          {/* ================= CARD HEADER ================= */}

          <View style={localStyles.cardHeader}>
            <Text style={localStyles.cardTitle}>Enter verification code</Text>

            <Text style={localStyles.cardSubtitle}>
              We sent a 4-digit code to
            </Text>

            <Text style={localStyles.email}>{email}</Text>
          </View>

          {/* ================= OTP ================= */}

          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoFocus={false}
            rootStyle={localStyles.codeField}
            renderCell={({ index, symbol, isFocused }) => (
              <View
                key={index}
                onLayout={getCellOnLayoutHandler(index)}
                style={[
                  localStyles.otpCell,
                  isFocused && localStyles.otpCellActive,
                ]}
              >
                <Text
                  style={[
                    localStyles.otpText,
                    isFocused && localStyles.otpTextActive,
                  ]}
                >
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              </View>
            )}
          />

          {/* ================= VERIFY ================= */}

          <View style={localStyles.buttonContainer}>
            <Button
              title={loading ? "Please wait..." : "Verify"}
              onPress={handleVerify}
              disabled={loading}
            />
          </View>

          {/* ================= RESEND ================= */}

          <View style={localStyles.resendContainer}>
            <Text style={localStyles.resendText}>Didn't receive the code?</Text>

            <TouchableOpacity
              onPress={handleResend}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  localStyles.resendButton,
                  loading && localStyles.resendDisabled,
                ]}
              >
                Resend
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= FOOTER ================= */}

        <View style={localStyles.footer}>
          <View style={localStyles.footerLine} />

          <View style={localStyles.footerIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={11}
              color={palette.slateTeal}
            />
          </View>

          <Text style={localStyles.footerText}>Secure verification</Text>

          <View style={localStyles.footerLine} />
        </View>
      </View>
    </View>
  );
};

export default OtpVerificationScreen;

const localStyles = StyleSheet.create({
  // ================= SCREEN =================

  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ================= HEADER =================

  header: {
    paddingTop: windowHeight(70),
    paddingHorizontal: windowWidth(20),
    paddingBottom: windowHeight(32),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  eyebrow: {
    fontFamily: displayFont,
    color: palette.routeAmber,

    fontSize: 11,
    letterSpacing: 2,

    marginBottom: windowHeight(14),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: displayFont,

    color: palette.white,

    fontSize: 23,
    lineHeight: 29,
  },

  headerSubtitle: {
    color: "#D1DFDD",

    fontSize: 12.5,

    marginTop: 3,

    lineHeight: 18,
  },

  // ================= CONTENT =================

  content: {
    flex: 1,

    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(25),
  },

  // ================= CARD =================

  card: {
    backgroundColor: palette.white,

    borderRadius: 20,

    paddingHorizontal: windowWidth(18),
    paddingVertical: windowHeight(23),

    borderWidth: 1,
    borderColor: palette.border,
  },

  cardHeader: {
    marginBottom: windowHeight(23),
  },

  cardTitle: {
    fontFamily: displayFont,

    fontSize: 19,

    color: palette.nightIndigo,

    marginBottom: 6,
  },

  cardSubtitle: {
    fontSize: 12.5,

    lineHeight: 18,

    color: palette.slateTeal,
  },

  email: {
    fontFamily: displayFont,

    fontSize: 12,

    color: palette.nightIndigo,

    marginTop: 4,
  },

  // ================= OTP =================

  codeField: {
    width: "100%",

    justifyContent: "space-between",
  },

  otpCell: {
    width: windowWidth(62),
    height: windowWidth(62),

    borderWidth: 1,
    borderColor: "#DDE6E5",

    borderRadius: 15,

    backgroundColor: "#F7F9F9",

    alignItems: "center",
    justifyContent: "center",
  },

  otpCellActive: {
    borderColor: palette.nightIndigo,

    backgroundColor: palette.lightTeal,
  },

  otpText: {
    fontFamily: displayFont,

    fontSize: 23,

    color: "#172525",
  },

  otpTextActive: {
    color: palette.nightIndigo,
  },

  // ================= BUTTON =================

  buttonContainer: {
    marginTop: windowHeight(22),
  },

  // ================= RESEND =================

  resendContainer: {
    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    marginTop: windowHeight(20),
  },

  resendText: {
    fontSize: 12,

    color: palette.slateTeal,
  },

  resendButton: {
    fontFamily: displayFont,

    fontSize: 12,

    color: palette.nightIndigo,

    marginLeft: 5,
  },

  resendDisabled: {
    opacity: 0.45,
  },

  // ================= FOOTER =================

  footer: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    marginTop: windowHeight(25),
  },

  footerLine: {
    width: 32,
    height: 1,

    backgroundColor: palette.border,
  },

  footerIcon: {
    marginLeft: 9,
  },

  footerText: {
    fontSize: 9,

    color: palette.slateTeal,

    marginHorizontal: 5,

    letterSpacing: 0.3,
  },
});
