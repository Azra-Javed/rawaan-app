import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";

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
    <View style={styles.container}>
      {/* LABEL */}
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}

      {/* COUNTRY SELECT */}
      <View
        style={[
          styles.selectWrapper,
          {
            borderColor: showWarning ? color.red : "#DDE7E6",
            backgroundColor: color.whiteColor,
          },
        ]}
      >
        {/* COUNTRY ICON */}
        <View style={styles.iconContainer} pointerEvents="none">
          <Ionicons name="globe-outline" size={18} color="#176B68" />
        </View>

        {/* PICKER */}
        <RNPickerSelect
          value={value}
          onValueChange={(selectedValue) => {
            console.log("Selected:", selectedValue);
            onValueChange(selectedValue);
          }}
          items={items}
          placeholder={{
            label: placeholder,
            value: null,
          }}
          useNativeAndroidPickerStyle={false}
          style={{
            inputIOS: styles.input,
            inputAndroid: styles.input,

            placeholder: {
              color: "#929E9E",
            },

            iconContainer: styles.arrowContainer,
          }}
          Icon={() => (
            <Ionicons name="chevron-down" size={18} color="#7C8989" />
          )}
        />
      </View>

      {/* WARNING */}
      {showWarning && warning && <Text style={styles.warning}>{warning}</Text>}
    </View>
  );
};

export default Select;

const styles = StyleSheet.create({
  /* =========================================
     CONTAINER
  ========================================= */

  container: {
    width: "100%",
    marginBottom: windowHeight(10),
  },

  /* =========================================
     LABEL
  ========================================= */

  title: {
    fontFamily: fonts.medium,
    fontSize: windowWidth(14),

    marginBottom: windowHeight(7),

    color: "#172525",
  },

  /* =========================================
     SELECT FIELD
  ========================================= */

  selectWrapper: {
    width: "100%",
    height: windowHeight(48),

    borderWidth: 1,
    borderRadius: 14,

    position: "relative",

    overflow: "hidden",
  },

  /* =========================================
     COUNTRY ICON
  ========================================= */

  iconContainer: {
    position: "absolute",

    left: windowWidth(9),
    top: windowHeight(7),

    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#E7F2F1",

    alignItems: "center",
    justifyContent: "center",

    zIndex: 1,
  },

  /* =========================================
     PICKER
  ========================================= */

  input: {
    width: "100%",
    height: windowHeight(48),

    /*
     * 50 = icon area
     * + extra spacing between icon and text
     */
    paddingLeft: windowWidth(58),

    /*
     * Space for arrow
     */
    paddingRight: windowWidth(42),

    fontFamily: fonts.regular,
    fontSize: windowWidth(14),

    color: "#172525",

    backgroundColor: "transparent",
  },

  /* =========================================
     ARROW
  ========================================= */

  arrowContainer: {
    position: "absolute",

    right: windowWidth(12),
    top: windowHeight(15),

    zIndex: 2,
  },

  /* =========================================
     WARNING
  ========================================= */

  warning: {
    color: color.red,

    fontFamily: fonts.regular,
    fontSize: windowWidth(12),

    marginTop: windowHeight(4),
    marginLeft: windowWidth(2),
  },
});
