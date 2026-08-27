import api from "@/api/client";
import Button from "@/components/common/button";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import { countryItems } from "@/configs/country-list";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { saveAuth } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import ScreenHeader from "@/components/common/screen-header";

const palette = {
  nightIndigo: "#0F4C4A",
  nightIndigoLight: "#176B68",
  routeAmber: "#F5A524",
  slateTeal: "#5C6B73",
  ivory: "#FBF8F2",
  ivoryLine: "#0F4C4A14",
  white: "#FFFFFF",
  inputBg: "#F4F7F7",
  inputBorder: "#E1E8E8",
};

const displayFont = "TT-Octosquares-Medium";

const RegisteranScreen = () => {
  const toast = useToast();

  const { email, userId, token } = useLocalSearchParams<{
    userId: string;
    email: string;
    token: string;
  }>();

  const emailValue = Array.isArray(email) ? email[0] : email;

  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    countryCode: "92",
    referralId: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setShowWarning(true);

    if (!formData.name.trim()) {
      return;
    }

    if (!formData.phoneNumber.trim()) {
      return;
    }

    if (!formData.countryCode) {
      return;
    }

    // Find selected country
    const selectedCountry = countryItems.find(
      (item) => item.value === formData.countryCode,
    );

    if (!selectedCountry?.isoCode) {
      toast.show("Please select a valid country", {
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const phoneNumber = parsePhoneNumberFromString(
        formData.phoneNumber,
        selectedCountry.isoCode as CountryCode,
      );

      if (!phoneNumber || !phoneNumber.isValid()) {
        setPhoneWarning("Please enter a valid phone number");
        return;
      }

      // This gives proper international format
      const fullPhoneNumber = phoneNumber.number;

      const response = await api.put("/user/register", {
        userId,
        email: emailValue,
        name: formData.name.trim(),
        phone_number: fullPhoneNumber,
      });

      toast.show("Account created successfully!", {
        type: "success",
      });

      await saveAuth(token, response.data.user);

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log("Registration error:", error);

      toast.show(error.response?.data?.message || "Failed to create account", {
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* =====================================================
        FIXED HEADER
    ====================================================== */}

      <ScreenHeader
        eyebrow="RAWAAN"
        title="Create your account"
        subtitle="Complete your profile to start riding"
        icon="person-add-outline"
        showDots
      />

      {/* =====================================================
        SCROLLABLE CONTENT
    ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formWrapper}>
          <View style={styles.formCard}>
            {/* Section heading */}

            <View style={styles.formHeader}>
              <View>
                <Text style={styles.formTitle}>Your details</Text>

                <Text style={styles.formSubtitle}>
                  Tell us a little about yourself
                </Text>
              </View>

              <View style={styles.formIcon}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={palette.nightIndigo}
                />
              </View>
            </View>

            {/* =================================================
              NAME
          ================================================== */}

            <View style={styles.inputSection}>
              <Input
                title="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                showWarning={showWarning && !formData.name.trim()}
                warning="Please enter your name"
              />
            </View>

            {/* =================================================
              EMAIL
          ================================================== */}

            <View style={styles.inputSection}>
              <Input
                title="Email"
                placeholder="Verified email"
                value={emailValue || ""}
                disabled={true}
              />

              <View style={styles.verifiedRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={palette.nightIndigoLight}
                />

                <Text style={styles.verifiedText}>Email verified</Text>
              </View>
            </View>

            {/* =================================================
              COUNTRY
          ================================================== */}

            <View style={styles.countrySection}>
              <Text style={styles.label}>Country</Text>

              <View style={styles.selectWrapper}>
                <SelectInput
                  placeholder="Select country"
                  value={formData.countryCode}
                  onValueChange={(value) => handleChange("countryCode", value)}
                  showWarning={showWarning && !formData.countryCode}
                  warning="Please select your country"
                  items={countryItems}
                />
              </View>
            </View>

            {/* =================================================
              PHONE
          ================================================== */}

            <View style={styles.inputSection}>
              <Input
                title="Phone Number"
                placeholder="3001234567"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) => {
                  const numbersOnly = text.replace(/\D/g, "");

                  handleChange("phoneNumber", numbersOnly);
                  setPhoneWarning("");
                }}
                showWarning={
                  showWarning &&
                  (!formData.phoneNumber.trim() || phoneWarning !== "")
                }
                warning={phoneWarning || "Please enter your phone number"}
              />
            </View>

            {/* =================================================
              INFO CARD
          ================================================== */}

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={17}
                  color={palette.nightIndigoLight}
                />
              </View>

              <Text style={styles.infoText}>
                Your information is kept secure and will only be used to manage
                your Rawaan account.
              </Text>
            </View>

            {/* =================================================
              SUBMIT
          ================================================== */}

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? "Creating..." : "Next"}
                backgroundColor={color.buttonBg}
                textColor={color.whiteColor}
                onPress={handleSubmit}
                disabled={loading}
              />
            </View>

            <View style={styles.bottomTextContainer}>
              <Text style={styles.bottomText}>
                Almost there — let's get you on the road.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisteranScreen;

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* =========================================================
     SCREEN
  ========================================================= */

  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  scrollContent: {
    paddingBottom: windowHeight(35),
  },

  /* =========================================================
     HEADER
  ========================================================= */

  header: {
    paddingTop: windowHeight(52),
    paddingBottom: windowHeight(28),
    paddingHorizontal: windowWidth(20),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    overflow: "hidden",
  },

  headerGlow: {
    position: "absolute",

    top: -80,
    right: -50,

    width: 200,
    height: 200,

    borderRadius: 100,

    backgroundColor: palette.routeAmber,

    opacity: 0.13,
  },

  eyebrow: {
    fontFamily: displayFont,

    color: palette.routeAmber,

    fontSize: 11,

    letterSpacing: 2.2,

    marginBottom: windowHeight(13),
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 48,
    height: 48,

    borderRadius: 15,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: displayFont,

    color: palette.white,

    fontSize: 23,

    lineHeight: 30,
  },

  headerSubtitle: {
    color: "#D1DFDD",

    fontSize: 13,

    marginTop: 4,

    lineHeight: 19,
  },

  /* =========================================================
     ROUTE DOTS
  ========================================================= */

  routeDotsContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: windowHeight(19),
  },

  routeDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: palette.routeAmber,

    marginRight: 8,
  },

  /* =========================================================
     FORM
  ========================================================= */

  formWrapper: {
    paddingHorizontal: windowWidth(20),

    marginTop: -2,
  },

  formCard: {
    backgroundColor: palette.white,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: palette.ivoryLine,

    paddingHorizontal: windowWidth(18),

    paddingTop: windowHeight(21),

    paddingBottom: windowHeight(18),
  },

  formHeader: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: windowHeight(18),
  },

  formTitle: {
    fontFamily: displayFont,

    fontSize: 18,

    color: palette.nightIndigo,
  },

  formSubtitle: {
    fontSize: 12.5,

    color: palette.slateTeal,

    marginTop: 4,

    lineHeight: 18,
  },

  formIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#0F4C4A12",

    alignItems: "center",
    justifyContent: "center",
  },

  /* =========================================================
     INPUT SECTIONS
  ========================================================= */

  inputSection: {
    marginBottom: windowHeight(10),
  },

  /* =========================================================
     LABEL
  ========================================================= */

  label: {
    fontFamily: displayFont,

    fontSize: 12,

    color: palette.nightIndigo,

    marginBottom: windowHeight(7),
  },

  countrySection: {
    marginBottom: windowHeight(10),
  },

  selectWrapper: {
    borderRadius: 14,

    overflow: "hidden",
  },

  /* =========================================================
     VERIFIED EMAIL
  ========================================================= */

  verifiedRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 6,

    paddingLeft: 3,
  },

  verifiedText: {
    fontSize: 10.5,

    color: palette.nightIndigoLight,

    marginLeft: 5,
  },

  /* =========================================================
     INFO
  ========================================================= */

  infoCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F4F8F7",

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#E0EBE9",

    paddingHorizontal: 11,

    paddingVertical: 10,

    marginTop: windowHeight(7),
  },

  infoIcon: {
    width: 30,
    height: 30,

    borderRadius: 9,

    backgroundColor: "#E4F0EE",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  infoText: {
    flex: 1,

    fontSize: 10.5,

    lineHeight: 15,

    color: palette.slateTeal,
  },

  /* =========================================================
     BUTTON
  ========================================================= */

  buttonContainer: {
    marginTop: windowHeight(19),
  },

  /* =========================================================
     BOTTOM
  ========================================================= */

  bottomTextContainer: {
    alignItems: "center",

    marginTop: windowHeight(13),
  },

  bottomText: {
    fontSize: 10.5,

    color: "#8A9696",

    textAlign: "center",
  },
});
