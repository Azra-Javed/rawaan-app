import api from "@/api/client";
import Button from "@/components/common/button";
import Input from "@/components/common/input";
import ScreenHeader from "@/components/common/screen-header";
import SelectInput from "@/components/common/select-input";
import { countryItems } from "@/configs/country-list";
import color from "@/themes/app.colors";
import { saveAuth } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import styles from "./styles";
import { StatusBar } from "expo-status-bar";

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
    <>
    <StatusBar style="light" backgroundColor={color.tealDark} />
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
                  color={color.nightIndigo}
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
                  color={color.nightIndigoLight}
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
                  color={color.nightIndigoLight}
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
    </View></>
  );
};

export default RegisteranScreen;
