import { View, Text, ScrollView, TextInput } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import ProgressBar from "@/components/common/progress.bar";
import styles from "./styles";
import TitleView from "@/components/common/title.view";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import { countryItems } from "@/configs/country-list";
import Button from "@/components/common/button";
import color from "@/themes/app.colors";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { Toast } from "react-native-toast-notifications";
import ScreenHeader from "@/components/common/screen-header";

const SignupScreen = () => {
  const { colors } = useTheme();

  const [emailFormatWarning, setEmailFormatWarning] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    countryValue: "",
    countryCode: "",
    phoneNumber: "",
    email: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Country selection
  const handleCountryChange = (countryValue: string) => {
    const selectedCountry = countryItems.find(
      (item) => item.value === countryValue,
    );

    if (!selectedCountry) return;

    setFormData((prev) => ({
      ...prev,
      country: selectedCountry.countryName,
      countryValue: selectedCountry.value,
      countryCode: selectedCountry.countryCode,
      phoneNumber: "",
    }));

    setPhoneWarning("");
  };

  const gotoDocument = () => {
    const isNameEmpty = formData.name.trim() === "";
    const isCountryEmpty = formData.country.trim() === "";
    const isPhoneEmpty = formData.phoneNumber.trim() === "";
    const isEmailEmpty = formData.email.trim() === "";

    const isEmailInvalid = !isEmailEmpty && emailFormatWarning !== "";

    const selectedCountry = countryItems.find(
      (item) => item.value === formData.countryValue,
    );

    if (!selectedCountry?.isoCode) {
      setShowWarning(true);
      Toast.show("Please select a valid country", {
        type: "warning",
      });
      return;
    }

    // Validate phone number
    let phoneNumber;

    if (!isPhoneEmpty) {
      phoneNumber = parsePhoneNumberFromString(
        formData.phoneNumber,
        selectedCountry.isoCode as CountryCode,
      );

      if (!phoneNumber || !phoneNumber.isValid()) {
        setPhoneWarning("Please enter a valid phone number");
      } else {
        setPhoneWarning("");
      }
    } else {
      setPhoneWarning("");
    }

    // Check all fields
    if (
      isNameEmpty ||
      isCountryEmpty ||
      isPhoneEmpty ||
      isEmailEmpty ||
      isEmailInvalid ||
      !phoneNumber ||
      !phoneNumber.isValid()
    ) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    setPhoneWarning("");

    const fullPhoneNumber = phoneNumber.number;

    const signupData = {
      name: formData.name.trim(),
      country: formData.country,
      country_code: formData.countryCode,
      phone_number: fullPhoneNumber,
      email: formData.email.trim().toLowerCase(),
    };

    router.push({
      pathname: "/(routes)/document-verification",
      params: signupData,
    });
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <ScreenHeader
        eyebrow="RAWAAN"
        title="Create your account"
        subtitle="Start your journey with Rawaan"
        icon="person-add-outline"
        showDots
      />
      {/* Form */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formCard}>
          {/* Progress */}
          <View style={styles.progressContainer}>
            <ProgressBar fill={1} />
          </View>

          {/* Form heading */}
          <View style={styles.formHeader}>
            <TitleView
              title="Personal details"
              subTitle="Tell us a little about yourself"
            />
          </View>

          {/* Name */}
          <Input
            title="Name"
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
            showWarning={showWarning && formData.name.trim() === ""}
            warning="Please enter your name"
          />

          {/* Country */}
          <View style={styles.fieldSpacing}>
            <SelectInput
              title="Country"
              placeholder="Select your country"
              value={formData.countryValue}
              onValueChange={handleCountryChange}
              showWarning={showWarning && formData.country.trim() === ""}
              items={countryItems}
            />
          </View>

          {/* Phone */}
          <View style={styles.phoneSection}>
            <Text style={styles.fieldLabel}>Phone Number</Text>

            <View
              style={[
                styles.phoneInput,
                {
                  borderColor:
                    showWarning &&
                    (formData.phoneNumber.trim() === "" || phoneWarning !== "")
                      ? color.red
                      : colors.border,
                },
              ]}
            >
              <View style={styles.countryCode}>
                <Ionicons
                  name="call-outline"
                  size={17}
                  color={color.nightIndigo}
                />

                <Text style={styles.countryCodeText}>
                  {formData.countryCode ? `+${formData.countryCode}` : "+__"}
                </Text>
              </View>

              <TextInput
                style={styles.phoneTextInput}
                placeholder={
                  formData.countryCode
                    ? "Enter phone number"
                    : "Select country first"
                }
                placeholderTextColor="#929E9E"
                value={formData.phoneNumber}
                onChangeText={(text) => {
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: text.replace(/[^0-9]/g, ""),
                  }));

                  setPhoneWarning("");
                }}
                keyboardType="phone-pad"
                editable={!!formData.countryCode}
              />
            </View>

            {/* Phone warning */}
            {showWarning &&
              (formData.phoneNumber.trim() === "" || phoneWarning !== "") && (
                <Text style={styles.warning}>
                  {phoneWarning || "Please enter your phone number!"}
                </Text>
              )}
          </View>

          {/* Email */}
          <View style={styles.fieldSpacing}>
            <Input
              title="Email Address"
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => {
                handleChange("email", text);

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (text.trim() === "") {
                  setEmailFormatWarning("");
                } else if (!emailRegex.test(text.trim())) {
                  setEmailFormatWarning("invalid");
                } else {
                  setEmailFormatWarning("");
                }
              }}
              showWarning={
                showWarning &&
                (formData.email.trim() === "" || emailFormatWarning !== "")
              }
              warning={
                formData.email.trim() === ""
                  ? "Please enter your email!"
                  : "Please enter a valid email!"
              }
              emailFormatWarning={emailFormatWarning}
            />
          </View>

          {/* Next */}
          <View style={styles.buttonContainer}>
            <Button
              onPress={gotoDocument}
              height={windowHeight(45)}
              title="Next"
              backgroundColor={color.buttonBg}
              textColor={color.whiteColor}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <Text style={styles.footerText}>Secure signup with RAWAAN</Text>

          <View style={styles.footerLine} />
        </View>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;
