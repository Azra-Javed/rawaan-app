import { external } from "@/styles/external.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import styles from "./style";
import Images from "../images";

type Props = {
  container: ReactNode;
  topSpace: any;
  showImage: boolean;
};

const AuthContainer = ({ container, topSpace, showImage }: Props) => {
  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {showImage && (
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowWidth(30),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Rawaan App
        </Text>
      )}

      <Image
        style={[styles.backgroundImage, { marginTop: topSpace }]}
        source={Images.authBg}
      />

      <View style={styles.contentContainer}>
        <View style={[styles.container]}>
          <ScrollView>{container}</ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AuthContainer;
