import { slides } from "@/configs/constants";
import color from "@/themes/app.colors";
import { BackArrow } from "@/utils/icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-swiper";
import localStyles from "./styles";
import { StatusBar } from "expo-status-bar";

type Slide = {
  image: ImageSourcePropType;
  text: string;
  description: string;
};

const OnBoardingScreen = () => {
  return (
    <>
    <StatusBar style="light" backgroundColor={color.tealDark} />
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
                  <BackArrow colors={color.white} width={20} height={20} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Swiper>
    </View></>
  );
};

export default OnBoardingScreen;
