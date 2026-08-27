import { slides } from "@/configs/constants";
import { BackArrow } from "@/utils/icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

type Slide = {
  image: ImageSourcePropType;
  text: string;
  description: string;
};

const palette = {
  nightIndigo: "#0F4C4A",
  nightIndigoLight: "#176B68",
  routeAmber: "#F5A524",
  slateTeal: "#5C6B73",
  ivory: "#FBF8F2",
  white: "#FFFFFF",
};

const displayFont = "TT-Octosquares-Medium";

const OnBoardingScreen = () => {
  return (
    <View style={localStyles.container}>
      <Swiper
        activeDotStyle={localStyles.activeDot}
        dotStyle={localStyles.dot}
        removeClippedSubviews={true}
        paginationStyle={localStyles.pagination}
      >
        {slides.map((slide: Slide, index) => (
          <View style={localStyles.slideContainer} key={index}>
            <View style={localStyles.imageContainer}>
              <Image
                style={localStyles.image}
                source={slide.image}
                resizeMode="cover"
              />

              <View style={localStyles.brand}>
                <Text style={localStyles.brandText}>RAWAAN</Text>
              </View>
            </View>

            <View style={localStyles.infoContainer}>
              <View style={localStyles.accentLine} />

              <Text style={localStyles.title}>{slide.text}</Text>

              <Text style={localStyles.description}>{slide.description}</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={localStyles.button}
                onPress={() => router.push("/(routes)/login")}
              >
                <Text style={localStyles.buttonText}>Get Started</Text>

                <View style={localStyles.arrowContainer}>
                  <BackArrow colors={palette.white} width={20} height={20} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
};

export default OnBoardingScreen;

const localStyles = StyleSheet.create({
  // ================= CONTAINER =================

  container: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ================= SLIDE =================

  slideContainer: {
    flex: 1,
    backgroundColor: palette.ivory,
  },

  // ================= IMAGE =================

  imageContainer: {
    flex: 0.62,

    overflow: "hidden",

    backgroundColor: "#E7F2F1",

    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  // ================= BRAND =================

  brand: {
    position: "absolute",

    top: 55,
    left: 22,

    paddingHorizontal: 13,
    paddingVertical: 8,

    borderRadius: 11,

    backgroundColor: "rgba(15,76,74,0.90)",
  },

  brandText: {
    fontFamily: displayFont,

    fontSize: 10,

    letterSpacing: 1.8,

    color: palette.routeAmber,
  },

  // ================= INFORMATION =================

  infoContainer: {
    flex: 0.38,

    paddingHorizontal: 24,
    paddingTop: 24,

    backgroundColor: palette.ivory,
  },

  accentLine: {
    width: 35,
    height: 4,

    borderRadius: 2,

    backgroundColor: palette.routeAmber,

    marginBottom: 13,
  },

  title: {
    fontFamily: displayFont,

    fontSize: 24,
    lineHeight: 31,

    color: palette.nightIndigo,

    maxWidth: 330,
  },

  description: {
    fontSize: 13,

    lineHeight: 20,

    color: palette.slateTeal,

    marginTop: 8,

    maxWidth: 340,
  },

  // ================= BUTTON =================

  button: {
    height: 52,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: palette.nightIndigo,

    borderRadius: 15,

    paddingLeft: 18,
    paddingRight: 6,

    marginTop: 18,

    width: "100%",
  },

  buttonText: {
    fontFamily: displayFont,

    fontSize: 13,

    color: palette.white,
  },

  arrowContainer: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: palette.nightIndigoLight,

    alignItems: "center",
    justifyContent: "center",

    transform: [{ rotate: "180deg" }],
  },

  // ================= PAGINATION =================

  pagination: {
    bottom: 18,

    right: 24,
    left: undefined,

    justifyContent: "flex-end",
  },

  activeDot: {
    width: 20,
    height: 5,

    borderRadius: 3,

    backgroundColor: palette.routeAmber,

    marginHorizontal: 3,
  },

  dot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#B8C8C6",

    marginHorizontal: 3,
  },
});
