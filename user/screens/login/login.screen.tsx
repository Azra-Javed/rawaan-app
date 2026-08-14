import Button from "@/components/common/button";
import EmailInput from "@/components/login/email.input";
import SignInText from "@/components/login/signin.text";
import { external } from "@/styles/external.style";
import { windowHeight } from "@/themes/app.constant";
import Images from "@/utils/images";
import { router } from "expo-router";
import { useState } from "react";
import { Image, View } from "react-native";
import AuthContainer from "../../utils/container/auth.container";
import styles from "./styles";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";

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
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/auth/send-otp`,
        {
          email: email.trim(),
        },
      );
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
    <AuthContainer
      topSpace={windowHeight(150)}
      showImage={true}
      container={
        <View>
          <View>
            <View>
              <Image style={styles.transformLine} source={Images.line} />
              <SignInText />
              <View style={[external.mt_25, external.Pb_10]}>
                <EmailInput width={700} email={email} setEmail={setEmail} />

                <View style={[external.mt_25, external.Pb_15]}>
                  <Button
                    title="Get OTP"
                    onPress={() => handleSubmit()}
                    disabled={loading}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      }
    ></AuthContainer>
  );
};

export default LoginScreen;
