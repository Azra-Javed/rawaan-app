import {
  View,
  Text,
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import fonts from "@/themes/app.fonts";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

interface InputProps {
  title: string;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  value?: string;
  warning?: string;
  onChangeText?: (text: string) => void;
  showWarning?: boolean;
  disabled?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
}

export default function Input({
  title,
  placeholder,
  keyboardType = "default",
  value = "",
  warning = "",
  onChangeText,
  showWarning = false,
  disabled = false,
  autoCapitalize = "sentences",
  autoCorrect = true,
  secureTextEntry = false,
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* =================================================
          LABEL
      ================================================== */}

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        {title}
      </Text>

      {/* =================================================
          INPUT
      ================================================== */}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: disabled ? "#EEF2F2" : "#F4F7F7",
            borderColor: showWarning
              ? color.red
              : disabled
                ? "#E1E7E7"
                : "#E1E8E8",
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9AA5A5"
          keyboardType={keyboardType}
          value={value}
          editable={!disabled}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          cursorColor="#176B68"
        />
      </View>

      {/* =================================================
          WARNING
      ================================================== */}

      {showWarning && warning !== "" && (
        <View style={styles.warningContainer}>
          <Text style={styles.warning}>{warning}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* =====================================================
     CONTAINER
  ====================================================== */

  container: {
    marginBottom: windowHeight(9),
  },

  /* =====================================================
     LABEL
  ====================================================== */

  title: {
    fontFamily: fonts.medium,

    fontSize: windowWidth(12),

    marginBottom: windowHeight(7),
  },

  /* =====================================================
     INPUT WRAPPER
  ====================================================== */

  inputWrapper: {
    height: windowHeight(48),

    borderRadius: 14,

    borderWidth: 1,

    paddingHorizontal: windowWidth(12),

    justifyContent: "center",
  },

  /* =====================================================
     INPUT
  ====================================================== */

  input: {
    flex: 1,

    fontFamily: fonts.regular,

    fontSize: windowWidth(13.5),

    paddingVertical: 0,
  },

  /* =====================================================
     WARNING
  ====================================================== */

  warningContainer: {
    paddingLeft: windowWidth(3),

    marginTop: windowHeight(4),
  },

  warning: {
    color: color.red,

    fontFamily: fonts.regular,

    fontSize: windowWidth(10.5),

    lineHeight: windowHeight(15),
  },
});
