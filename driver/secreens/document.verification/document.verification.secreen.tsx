import api from "@/api/client";
import Button from "@/components/common/button";
import Input from "@/components/common/input";
import ProgressBar from "@/components/common/progress.bar";
import ScreenHeader from "@/components/common/screen-header";
import SelectInput from "@/components/common/select-input";
import TitleView from "@/components/common/title.view";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Toast } from "react-native-toast-notifications";
import styles from "./styles";

const DocumentVerificationSecreen = () => {
  const signupData = useLocalSearchParams();

  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    vehicleType: "Car",
    registrationNumber: "",
    registrationDate: "",
    drivingLicenseNumber: "",
    color: "",
    rate: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const driver = {
      ...signupData,
      vehicle_type: formData.vehicleType,
      registeration_number: formData.registrationNumber,
      registration_date: formData.registrationDate,
      driving_license: formData.drivingLicenseNumber,
      vehicle_color: formData.color,
      rate: formData.rate,
    };

    await api
      .post("/driver/auth/registeration-otp", {
        driver,
      })
      .then((res) => {
        setLoading(false);

        Toast.show(res.data.message, {
          type: "success",
        });

        router.push({
          pathname: "/(routes)/otp-verification",
          params: {
            email: Array.isArray(signupData?.email)
              ? signupData.email[0]
              : signupData?.email,

            type: "registration",
          },
        });
      })
      .catch((error) => {
        setLoading(false);
        if (
          error.response?.data?.message ===
          "Driver already registered. Please login."
        )
          router.push("/(routes)/login");

        Toast.show(error.response?.data?.message || "Something went wrong", {
          type: "danger",
        });
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.ivory }}>
      <ScreenHeader
        eyebrow="RAWAAN"
        title="Vehicle registration"
        subtitle="Add your vehicle details to continue"
        icon="car-outline"
        showDots
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: windowWidth(20),
          paddingTop: windowHeight(22),
          paddingBottom: windowHeight(40),
        }}
      >
        <View style={styles.formCard}>
          {/* Progress */}
          <View style={styles.progressContainer}>
            <ProgressBar fill={2} />
          </View>

          {/* Form heading */}
          <View style={styles.formHeader}>
            <TitleView
              title="Vehicle details"
              subTitle="Tell us a little about the vehicle you will use for rides."
            />
          </View>

          {/* Vehicle type */}
          <View style={styles.field}>
            <SelectInput
              title="Vehicle Type"
              placeholder="Choose your vehicle type"
              value={formData.vehicleType}
              onValueChange={(text) => handleChange("vehicleType", text)}
              showWarning={showWarning && formData.vehicleType === ""}
              warning="Please choose your vehicle type!"
              items={[
                { label: "Car", value: "Car" },
                { label: "Motorcycle", value: "Motorcycle" },
                { label: "cng", value: "cng" },
              ]}
            />
          </View>

          {/* Registration number */}
          <View style={styles.field}>
            <Input
              title="Registration Number"
              placeholder="Enter your vehicle registration number"
              keyboardType="number-pad"
              value={formData.registrationNumber}
              onChangeText={(text) => handleChange("registrationNumber", text)}
              showWarning={showWarning && formData.registrationNumber === ""}
              warning="Please enter your vehicle registration number!"
            />
          </View>

          {/* Registration date */}
          <View style={styles.field}>
            <Input
              title="Vehicle Registration Date"
              placeholder="Enter your vehicle registration date"
              value={formData.registrationDate}
              onChangeText={(text) => handleChange("registrationDate", text)}
              showWarning={showWarning && formData.registrationDate === ""}
              warning="Please enter your vehicle Registration Date number!"
            />
          </View>

          {/* Driving license */}
          <View style={styles.field}>
            <Input
              title="Driving License Number"
              placeholder="Enter your driving license number"
              keyboardType="number-pad"
              value={formData.drivingLicenseNumber}
              onChangeText={(text) =>
                handleChange("drivingLicenseNumber", text)
              }
              showWarning={showWarning && formData.drivingLicenseNumber === ""}
              warning="Please enter your driving license number!"
            />
          </View>

          {/* Vehicle color */}
          <View style={styles.field}>
            <Input
              title="Vehicle Color"
              placeholder="Enter your vehicle color"
              value={formData.color}
              onChangeText={(text) => handleChange("color", text)}
              showWarning={showWarning && formData.color === ""}
              warning="Please enter your vehicle color!"
            />
          </View>

          {/* Rate */}
          <View style={styles.field}>
            <Input
              title="Rate per km"
              placeholder="Amount you want to charge per km"
              keyboardType="number-pad"
              value={formData.rate}
              onChangeText={(text) => handleChange("rate", text)}
              showWarning={showWarning && formData.rate === ""}
              warning="Please enter how much you want to charge from your customer per km."
            />
          </View>

          {/* Submit */}
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => handleSubmit()}
              title={loading ? "Submitting..." : "Submit"}
              height={windowHeight(30)}
              backgroundColor={color.buttonBg}
              textColor={color.whiteColor}
              disabled={loading}
            />
          </View>
        </View>

        {/* Bottom information */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={color.buttonBg}
            />
          </View>

          <Text style={styles.bottomText}>
            Your vehicle information is kept secure.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DocumentVerificationSecreen;
