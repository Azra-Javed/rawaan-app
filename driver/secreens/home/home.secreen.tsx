import { View, Text, FlatList, Modal } from "react-native";
import React, { useState } from "react";
import Header from "@/components/common/header";
import { external } from "@/styles/external.style";
import styles from "./styles";
import { recentRidesData, rideData } from "@/configs/constants";
import RenderRideItem from "@/components/ride/render-ride-item";
import { useTheme } from "@react-navigation/native";
import RideCard from "@/components/ride/ride.card";
import { useDriver } from "@/hooks/useDriver";

const HomeSecreen = () => {
  const { driver, loading: DriverDataLoading } = useDriver();
  const [userData, setUserData] = useState<any>(null);
  const [isOn, setIsOn] = useState<any>();
  const [loading, setloading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocationName, setcurrentLocationName] = useState("");
  const [destinationLocationName, setdestinationLocationName] = useState("");
  const [distance, setdistance] = useState<any>();
  const [wsConnected, setWsConnected] = useState(false);
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [lastLocation, setLastLocation] = useState<any>(null);
  const [recentRides, setrecentRides] = useState([]);
  const ws = new WebSocket("ws://192.168.1.2:8080");

  const { colors } = useTheme();
  const handleStatusChange = () => {
    setIsOn(!isOn);
  };

  const handleClose = () => {};

  return (
    <View style={[external.fx_1]}>
      <View style={styles.spaceBelow}>
        <Header isOn={isOn} toggleSwitch={() => handleStatusChange()} />
        <FlatList
          data={rideData}
          numColumns={2}
          renderItem={({ item }) => (
            <RenderRideItem item={item} colors={colors} />
          )}
        />

        <View style={[styles.rideContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.rideTitle, { color: colors.text }]}>
            Recent Rides
          </Text>

          <FlatList
            data={recentRidesData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RideCard item={item} />}
          />
        </View>
      </View>
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleClose}
      ></Modal>
    </View>
  );
};

export default HomeSecreen;
