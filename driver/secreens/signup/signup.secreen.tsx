import { View, Text, ScrollView, TextInput } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";

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

const SignupScreen = () => {
  const { colors } = useTheme();

  const [emailFormatWarning, setEmailFormatWarning] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    countryValue: "", // raw `value` from countryItems, used for reliable lookup
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

      // Country name
      country: selectedCountry.countryName,

      // Keep the original `value` so we can look this country back up later
      countryValue: selectedCountry.value,

      // Country dialing code
      countryCode: selectedCountry.countryCode,

      // Clear phone when country changes
      phoneNumber: "",
    }));

    // Clear previous phone warning
    setPhoneWarning("");
  };

  const gotoDocument = () => {
    const isNameEmpty = formData.name.trim() === "";
    const isCountryEmpty = formData.country.trim() === "";
    const isPhoneEmpty = formData.phoneNumber.trim() === "";
    const isEmailEmpty = formData.email.trim() === "";

    const isEmailInvalid = !isEmailEmpty && emailFormatWarning !== "";

    // Find selected country -- FIXED: look up by countryValue, not countryCode
    const selectedCountry = countryItems.find(
      (item) => item.value === formData.countryValue,
    );

    if (!selectedCountry?.isoCode) {
      // FIXED: also flag other empty fields instead of returning silently
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

    // This gives proper international format
    const fullPhoneNumber = phoneNumber.number;

    // Data that will be sent to backend
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        {/* Logo */}
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(22),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Rawaan App
        </Text>

        <View style={{ padding: windowWidth(20) }}>
          <ProgressBar fill={1} />

          <View
            style={[
              styles.subView,
              {
                backgroundColor: colors.background,
              },
            ]}
          >
            <View style={styles.space}>
              <TitleView
                title="Create your account"
                subTitle="Explore your life by joining Rawaan App"
              />

              {/* NAME */}
              <Input
                title="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                showWarning={showWarning && formData.name.trim() === ""}
                warning="Please enter your name"
              />

              {/* COUNTRY */}
              <SelectInput
                title="Country"
                placeholder="Select your country"
                value={formData.countryValue}
                onValueChange={handleCountryChange}
                showWarning={showWarning && formData.country.trim() === ""}
                items={countryItems}
              />

              {/* PHONE NUMBER */}
              <View>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: windowHeight(14),
                    marginBottom: windowHeight(8),
                  }}
                >
                  Phone Number
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor:
                      showWarning &&
                      (formData.phoneNumber.trim() === "" ||
                        phoneWarning !== "")
                        ? "red"
                        : colors.border,
                    borderRadius: 8,
                    height: windowHeight(48),
                    overflow: "hidden",
                  }}
                >
                  {/* COUNTRY CODE */}
                  <View
                    style={{
                      paddingHorizontal: windowWidth(12),
                      justifyContent: "center",
                      height: "100%",
                      borderRightWidth: 1,
                      borderRightColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: windowHeight(15),
                      }}
                    >
                      {formData.countryCode
                        ? `+${formData.countryCode}`
                        : "+__"}
                    </Text>
                  </View>

                  {/* PHONE */}
                  <TextInput
                    style={{
                      flex: 1,
                      height: "100%",
                      paddingHorizontal: windowWidth(12),
                      color: colors.text,
                      fontSize: windowHeight(15),
                    }}
                    placeholder={
                      formData.countryCode
                        ? "Enter phone number"
                        : "Select country first"
                    }
                    placeholderTextColor={colors.text + "80"}
                    value={formData.phoneNumber}
                    onChangeText={(text) => {
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: text.replace(/[^0-9]/g, ""),
                      }));

                      // Clear warning when user starts typing
                      setPhoneWarning("");
                    }}
                    keyboardType="phone-pad"
                    editable={!!formData.countryCode}
                  />
                </View>

                {/* PHONE WARNING */}
                {showWarning &&
                  (formData.phoneNumber.trim() === "" ||
                    phoneWarning !== "") && (
                    <Text
                      style={{
                        color: "red",
                        fontSize: windowHeight(12),
                        marginTop: windowHeight(5),
                      }}
                    >
                      {phoneWarning || "Please enter your phone number!"}
                    </Text>
                  )}
              </View>

              {/* EMAIL */}
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

            {/* NEXT */}
            <View style={styles.margin}>
              <Button
                onPress={gotoDocument}
                height={windowHeight(30)}
                title="Next"
                backgroundColor={color.buttonBg}
                textColor={color.whiteColor}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;
