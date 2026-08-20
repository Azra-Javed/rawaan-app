import api from "@/api/client";
import Button from "@/components/common/button";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import TitleView from "@/components/signup/title.view";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { countryItems } from "@/configs/country-list";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const RegisteranScreen = () => {
  const { colors } = useTheme();
  const toast = useToast();

  const { email, userId } = useLocalSearchParams<{
    userId: string;
    email: string;
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

      console.log("Registration:", response.data);

      toast.show("Account created successfully!", {
        type: "success",
      });

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
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        {/* Logo */}
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(25),
            paddingTop: windowHeight(50),
            textAlign: "center",
            color: colors.text,
          }}
        >
          Manzil App
        </Text>

        <View style={{ padding: windowWidth(20) }}>
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
                subTitle="Enjoy your life by joining Manzil app"
              />

              {/* Name */}
              <Input
                title="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                showWarning={showWarning && !formData.name.trim()}
                warning="Please enter your name"
              />

              {/* Email */}
              <Input
                title="Email"
                placeholder="Verified email"
                value={emailValue || ""}
                disabled={true}
              />

              {/* Country Code */}
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Country
              </Text>

              <View style={styles.countryContainer}>
                <SelectInput
                  placeholder="Select country"
                  value={formData.countryCode}
                  onValueChange={(value) => handleChange("countryCode", value)}
                  showWarning={showWarning && !formData.countryCode}
                  warning="Please select your country"
                  items={countryItems}
                />
              </View>

              {/* Phone */}
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

              {/* Submit */}
              <View style={styles.margin}>
                <Button
                  title={loading ? "Creating..." : "Next"}
                  backgroundColor={color.buttonBg}
                  textColor={color.whiteColor}
                  onPress={handleSubmit}
                  disabled={loading}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  subView: {
    flex: 1,
  },

  space: {
    marginHorizontal: windowWidth(4),
  },

  label: {
    fontSize: windowWidth(16),
    marginTop: windowHeight(10),
    marginBottom: windowHeight(6),
    fontWeight: "500",
  },

  countryContainer: {
    marginBottom: windowHeight(8),
  },

  margin: {
    marginVertical: windowHeight(12),
  },
});

export default RegisteranScreen;
