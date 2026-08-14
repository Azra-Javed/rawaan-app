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
      {/* Label */}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: disabled ? color.lightGray : color.whiteColor,
            borderColor: showWarning ? color.red : colors.border,
            color: colors.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={color.secondaryFont}
        keyboardType={keyboardType}
        value={value}
        editable={!disabled}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
      />

      {/* Warning */}
      {showWarning && warning !== "" && (
        <Text style={styles.warning}>{warning}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: windowHeight(8),
  },

  title: {
    fontFamily: fonts.medium,
    fontSize: windowWidth(16),
    marginBottom: windowHeight(6),
  },

  input: {
    height: windowHeight(45),
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: windowWidth(12),
    fontFamily: fonts.regular,
    fontSize: windowWidth(15),
  },

  warning: {
    color: color.red,
    fontFamily: fonts.regular,
    fontSize: windowWidth(12),
    marginTop: windowHeight(4),
  },
});
