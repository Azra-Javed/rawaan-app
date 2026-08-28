import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import fonts from "@/themes/app.fonts";
import SwitchToggle from "react-native-switch-toggle";
import { Notification } from "@/utils/icons";

interface HeaderProps {
  isOn: boolean;
  toggleSwitch: () => void;
}

export default function Header({ isOn, toggleSwitch }: HeaderProps) {
  return (
    <View style={styles.headerMain}>
      <View style={styles.headerMargin}>
        {/* Top row */}
        <View style={styles.headerAlign}>
          <View style={styles.headerTitle}>
            <Text style={styles.logoText}>RAWAAN</Text>
          </View>

          <TouchableOpacity style={styles.notificationIcon} activeOpacity={0.7}>
            <Notification colors={color.whiteColor} />
          </TouchableOpacity>
        </View>

        {/* Availability card */}
        <View style={styles.switchContainer}>
          <View style={styles.statusContent}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isOn ? "#35B56A" : "#8F9A99",
                },
              ]}
            />

            <View>
              <Text
                style={[
                  styles.valueTitle,
                  {
                    color: isOn ? "#167A4A" : color.slateTeal,
                  },
                ]}
              >
                {isOn ? "Online" : "Offline"}
              </Text>

              <Text style={styles.statusSubtitle}>
                You are {isOn ? "available" : "not available"} for rides
              </Text>
            </View>
          </View>

          <View style={styles.switchBorder}>
            <SwitchToggle
              switchOn={isOn}
              onPress={toggleSwitch}
              containerStyle={styles.switchView}
              circleStyle={styles.switchCircle}
              backgroundColorOff={color.lightGray}
              backgroundColorOn={color.lightGray}
              circleColorOn={color.primary}
              circleColorOff={color.blackColor}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerMain: {
    backgroundColor: color.nightIndigo,
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(25),
    paddingBottom: windowHeight(16),
    width: "100%",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },

  headerMargin: {
    marginTop: windowHeight(20),
  },

  headerAlign: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    alignItems: "flex-start",
  },

  logoText: {
    fontFamily: fonts.display,
    fontSize: windowHeight(20),
    color: color.routeAmber,
    letterSpacing: 2,
  },

  welcomeText: {
    marginTop: windowHeight(3),
    fontFamily: fonts.regular,
    fontSize: windowHeight(11),
    color: color.headerSubtitle,
  },

  notificationIcon: {
    width: windowWidth(42),
    height: windowWidth(42),
    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  switchContainer: {
    minHeight: windowHeight(52),

    marginTop: windowHeight(16),

    backgroundColor: color.whiteColor,

    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: windowWidth(14),

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,

    marginRight: windowWidth(9),
  },

  valueTitle: {
    fontFamily: fonts.medium,
    fontSize: windowHeight(13),
  },

  statusSubtitle: {
    marginTop: windowHeight(2),

    fontFamily: fonts.regular,
    fontSize: windowHeight(10.5),

    color: color.slateTeal,
  },

  switchBorder: {
    height: windowHeight(25),
    width: windowWidth(49),

    borderWidth: 1,
    borderRadius: 20,

    borderColor: color.ivoryLine,

    alignItems: "center",
    justifyContent: "center",
  },

  switchView: {
    height: windowHeight(21),
    width: windowWidth(43),

    borderRadius: 20,

    padding: 3,
  },

  switchCircle: {
    height: windowHeight(15),
    width: windowWidth(15),

    borderRadius: 10,
  },
});
