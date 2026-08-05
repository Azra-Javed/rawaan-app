import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";

interface InputProps {
  title?: string;
  placeholder: string;
  items: { label: string; value: string }[];
  value?: string;
  warning?: string;
  onValueChange: (value: string) => void;
  showWarning?: boolean;
}

const Select = ({
  title,
  placeholder,
  items,
  value,
  warning,
  onValueChange,
  showWarning,
}: InputProps) => {
  const { colors } = useTheme();
  return (
    <View>
      {/* <Text style={[styles.title, { color: colors.text }]}>Select input</Text> */}
      <RNPickerSelect
        value={value}
        onValueChange={(value) => {
          console.log("Selected:", value);
          onValueChange(value);
        }}
        items={items}
        placeholder={{
          label: placeholder,
          value: null,
        }}
        useNativeAndroidPickerStyle={false}
        style={{
          inputIOS: {
            ...styles.input,
            backgroundColor: color.lightGray,
            borderColor: color.border,
            height: windowHeight(39),
          },
          inputAndroid: {
            ...styles.input,
            backgroundColor: color.lightGray,
            borderColor: color.border,
            height: windowHeight(39),
          },
        }}
      />

      {showWarning && <Text style={styles.warning}>{warning}</Text>}
    </View>
  );
};

export default Select;

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.medium,
    fontSize: windowWidth(20),
    marginVertical: windowHeight(8),
  },
  input: {
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 5,
    height: windowHeight(30),
    color: color.secondaryFont,
    paddingHorizontal: 10,
  },
  warning: {
    color: color.red,
    marginTop: 3,
  },
});
