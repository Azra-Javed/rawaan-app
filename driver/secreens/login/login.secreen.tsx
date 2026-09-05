import api from "@/api/client";
import Button from "@/components/common/button";
import EmailInput from "@/components/login/email.input";
import localStyles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import color from "@/themes/app.colors";
import RouteDots from "@/components/common/route-dots";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.show("Please enter your email address", {
        type: "warning",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await api.post(`/driver/auth/send-otp`, {
        email: email.trim(),
      });
       console.log("response", response.data);
      setLoading(false);
      toast.show(response.data.message || "OTP sent successfully", {
        type: "success",
      });

      router.push({
        pathname: "/(routes)/otp-verification",
        params: {
          email: email.trim(),
          type: "login",
        },
      });
    } catch (error: any) {
      setLoading(false);

      toast.show(error.response?.data?.message || "Something went wrong.", {
        type: "danger",
      });
    }
  };

  return (
    <View style={localStyles.screen}>
      {/* Header */}
      <LinearGradient
        colors={[color.nightIndigo, color.nightIndigoLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.header}
      >
        <Text style={localStyles.eyebrow}>RAWAAN</Text>
        <View style={localStyles.titleRow}>
          <View style={localStyles.titleIcon}>
            <Ionicons name="car-outline" size={21} color={color.routeAmber} />
          </View>
          <View>
            <Text style={localStyles.title}>Welcome, Driver</Text>

            <Text style={localStyles.subtitle}>
              Sign in to start your journey
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <RouteDots />
        </View>
      </LinearGradient>

      {/* Login form */}
      <View style={localStyles.content}>
        <View style={localStyles.formCard}>
          <View style={localStyles.formHeader}>
            <Text style={localStyles.formTitle}>Driver Sign in</Text>

            <Text style={localStyles.formSubtitle}>
              Enter your email address to receive a one-time password.
            </Text>
          </View>

          {/* Email */}
          <View style={localStyles.inputContainer}>
            <EmailInput width="100%" email={email} setEmail={setEmail} />
          </View>

          {/* Login button */}
          <View style={localStyles.buttonContainer}>
            <Button
              title={loading ? "Please wait..." : "Get OTP"}
              onPress={() => handleSubmit()}
              disabled={loading}
            />
          </View>

          {/* Driver signup */}
          <View style={localStyles.signupContainer}>
            <Text style={localStyles.signupText}>
              Don't have a driver account?
            </Text>

            <Text
              style={localStyles.signupLink}
              onPress={() => router.push("/(routes)/signup")}
            >
              Sign Up
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={localStyles.footer}>
          <View style={localStyles.footerLine} />

          <Text style={localStyles.footerText}>
            Secure driver login with RAWAAN
          </Text>

          <View style={localStyles.footerLine} />
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
