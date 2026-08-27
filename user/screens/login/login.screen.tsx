import api from "@/api/client";
import Button from "@/components/common/button";
import EmailInput from "@/components/login/email.input";
import { windowHeight } from "@/themes/app.constant";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";

const palette = {
  nightIndigo: "#0F4C4A",
  nightIndigoLight: "#176B68",
  routeAmber: "#F5A524",
  slateTeal: "#5C6B73",
  ivory: "#FBF8F2",
  white: "#FFFFFF",
};

const displayFont = "TT-Octosquares-Medium";

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
      const response = await api.post(`/auth/send-otp`, {
        email: email.trim(),
      });
      setLoading(false);
      toast.show(response.data.message || "OTP sent successfully", {
        type: "success",
      });

      router.push({
        pathname: "/(routes)/otp-verification",
        params: {
          email: email.trim(),
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
      <LinearGradient
        colors={[palette.nightIndigo, palette.nightIndigoLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.header}
      >
        <Text style={localStyles.eyebrow}>RAWAAN</Text>

        <View style={localStyles.titleRow}>
          <View style={localStyles.titleIcon}>
            <Ionicons
              name="navigate-outline"
              size={21}
              color={palette.routeAmber}
            />
          </View>

          <View>
            <Text style={localStyles.title}>Welcome back</Text>

            <Text style={localStyles.subtitle}>
              Sign in to continue your journey
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={localStyles.content}>
        <View style={localStyles.formCard}>
          <View style={localStyles.formHeader}>
            <Text style={localStyles.formTitle}>Sign in</Text>

            <Text style={localStyles.formSubtitle}>
              Enter your email address to receive a one-time password.
            </Text>
          </View>

          <View style={localStyles.inputContainer}>
            <EmailInput width="100%" email={email} setEmail={setEmail} />
          </View>

          <View style={localStyles.buttonContainer}>
            <Button
              title="Get OTP"
              onPress={() => handleSubmit()}
              disabled={loading}
            />
          </View>
        </View>

        <View style={localStyles.footer}>
          <View style={localStyles.footerLine} />

          <Text style={localStyles.footerText}>Secure login with RAWAAN</Text>

          <View style={localStyles.footerLine} />
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const localStyles = StyleSheet.create({
  // ================= SCREEN =================

  screen: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ================= HEADER =================

  header: {
    paddingTop: windowHeight(75),
    paddingHorizontal: 24,
    paddingBottom: windowHeight(45),

    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  eyebrow: {
    fontFamily: displayFont,
    color: palette.routeAmber,

    fontSize: 11,
    letterSpacing: 2,

    marginBottom: windowHeight(15),
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  title: {
    fontFamily: displayFont,

    color: palette.white,

    fontSize: 24,
    lineHeight: 30,
  },

  subtitle: {
    color: "#D1DFDD",

    fontSize: 12.5,

    marginTop: 3,

    lineHeight: 18,
  },

  // ================= CONTENT =================

  content: {
    flex: 1,

    paddingHorizontal: 20,
    paddingTop: windowHeight(28),
  },

  // ================= FORM =================

  formCard: {
    backgroundColor: palette.white,

    borderRadius: 20,

    paddingHorizontal: 18,
    paddingVertical: 22,

    borderWidth: 1,
    borderColor: "#0F4C4A12",
  },

  formHeader: {
    marginBottom: windowHeight(22),
  },

  formTitle: {
    fontFamily: displayFont,

    fontSize: 20,

    color: palette.nightIndigo,

    marginBottom: 5,
  },

  formSubtitle: {
    fontSize: 12.5,

    lineHeight: 19,

    color: palette.slateTeal,
  },

  // ================= INPUT =================

  inputContainer: {
    width: "100%",
  },

  // ================= BUTTON =================

  buttonContainer: {
    marginTop: windowHeight(20),
  },

  // ================= FOOTER =================

  footer: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: windowHeight(25),
  },

  footerLine: {
    height: 1,

    width: 35,

    backgroundColor: "#0F4C4A18",
  },

  footerText: {
    fontSize: 9,

    color: palette.slateTeal,

    marginHorizontal: 10,

    letterSpacing: 0.4,
  },
});
