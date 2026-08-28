import {
  Text,
  TextInput,
  View,
  StyleSheet,
  DimensionValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import color from "@/themes/app.colors";

interface Props {
  width: DimensionValue;
  email: string;
  setEmail: (email: string) => void;
}

export default function EmailInput({ width = "100%", email, setEmail }: Props) {
  return (
    <View style={styles.container}>
      {/* LABEL */}
      <Text style={styles.label}>Email Address</Text>

      {/* EMAIL INPUT */}
      <View
        style={[
          styles.inputWrapper,
          {
            width: "100%",
            maxWidth: width,
            borderColor: color.border,
          },
        ]}
      >
        {/* ICON */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={18} color="#176B68" />
        </View>

        {/* INPUT */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#929E9E"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* =========================================
     CONTAINER
  ========================================= */

  container: {
    width: "100%",
  },

  /* =========================================
     LABEL
  ========================================= */

  label: {
    fontFamily: fonts.medium,
    fontSize: windowWidth(14),

    color: "#172525",

    marginTop: windowHeight(8),
    marginBottom: windowHeight(7),
  },

  /* =========================================
     INPUT WRAPPER
  ========================================= */

  inputWrapper: {
    width: "100%",
    maxWidth: "100%",

    height: windowHeight(48),

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: color.whiteColor,

    borderWidth: 1,
    borderColor: "#DDE7E6",

    borderRadius: 14,

    paddingHorizontal: windowWidth(9),
  },

  /* =========================================
     ICON
  ========================================= */

  iconContainer: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#E7F2F1",

    alignItems: "center",
    justifyContent: "center",

    marginRight: windowWidth(9),
  },

  /* =========================================
     TEXT INPUT
  ========================================= */

  input: {
    flex: 1,

    height: windowHeight(48),

    paddingHorizontal: 0,
    paddingVertical: 0,

    fontFamily: fonts.regular,
    fontSize: windowWidth(14),

    color: "#172525",
  },
});
