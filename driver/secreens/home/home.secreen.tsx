import { View, Text, FlatList, Modal, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Header from "@/components/common/header";
import { external } from "@/styles/external.style";
import styles from "./styles";
import { recentRidesData, rideData } from "@/configs/constants";
import RenderRideItem from "@/components/ride/render-ride-item";
import { useTheme } from "@react-navigation/native";
import RideCard from "@/components/ride/ride.card";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/button";
import { Gps, Location as LocationIcon } from "@/utils/icons";
import color from "@/themes/app.colors";
import type { Coord } from "@/utils/osrm";
import type { PlaceResult } from "@/utils/nominatim";

import * as Location from "expo-location";
import api from "@/api/client";
import { getItem, setItem } from "@/utils/authStorage";

const HomeSecreen = () => {
  const { colors } = useTheme();

  // initial location
  const [region, setRegion] = useState<any>({
    latitude: 31.5497,
    longitude: 74.3436,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [currentLocation, setCurrentLocation] = useState<Coord | null>(null);

  // Pickup and destination
  const [pickup, setPickup] = useState<Coord | null>(null);
  const [dropoff, setDropoff] = useState<PlaceResult | null>(null);

  // route
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);

  // Ride/ UI state
  const [isOn, setIsOn] = useState<boolean>(false);
  const [loading, setloading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get current location

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;

        const current = { latitude, longitude };

        setCurrentLocation(current);
        setPickup(current);

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.log("Current location error:", error);
      }
    })();

    // Get saved status
    (async () => {
      const status = await getItem("status");
      setIsOn(status === "active");
    })();
  }, []);

  const handleStatusChange = async () => {
    try {
      setloading(true);

      const newStatus = isOn ? "inactive" : "active";

      const changeStatus = await api.put(`/driver/update-status`, {
        status: newStatus,
      });

      const status = changeStatus.data?.driver?.status;

      if (status) {
        await setItem("status", status.toString());
        setIsOn(status === "active");
      }
    } catch (error) {
      console.log("Status change error:", error);
    } finally {
      setloading(false);
    }
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const acceptRideHandler = () => {};

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
          <Text
            style={[styles.rideTitle, { color: colors.text }]}
            onPress={() => setIsModalVisible(true)}
          >
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
      >
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1}>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
            <View>
              <Text style={styles.modalTitle}>New Ride Request Received!</Text>
            </View>

            <MapView
              key={isModalVisible ? "map-visible" : "map-hidden"}
              style={{
                width: "100%",
                height: windowHeight(250),
                marginTop: windowHeight(10),
              }}
              region={region}
              onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
              rotateEnabled={true}
              zoomEnabled={true}
              zoomControlEnabled={true}
              showsCompass={true}
              pitchEnabled={true}
              scrollEnabled={true}
            >
              <UrlTile
                urlTemplate={`https://api.maptiler.com/maps/positron-v4/256/{z}/{x}/{y}.png?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
                maximumZ={20}
              />

              {/* Pickup */}
              {currentLocation && (
                <Marker coordinate={currentLocation} title="Pickup" />
              )}

              {/* Destination */}
              {dropoff && (
                <Marker
                  coordinate={{
                    latitude: dropoff.latitude,
                    longitude: dropoff.longitude,
                  }}
                  title="Dropoff"
                  pinColor="red"
                />
              )}

              {/* Route */}
              {routeCoords.length > 0 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeWidth={4}
                  strokeColor="blue"
                />
              )}
            </MapView>

            {/* Attribution */}
            <View
              style={{
                alignItems: "flex-end",
                marginTop: -windowHeight(16),
                marginBottom: windowHeight(6),
              }}
            >
              <Text style={{ fontSize: 9 }}>
                © MapTiler © OpenStreetMap contributors
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View style={styles.leftView}>
                <LocationIcon color={colors.text} />
                <View
                  style={[styles.verticaldot, { borderColor: color.buttonBg }]}
                />
                <Gps colors={colors.text} />
              </View>
              <View style={styles.rightView}>
                <Text style={[styles.pickup, { color: colors.text }]}>
                  "chunian "
                </Text>
                <View style={styles.border} />
                <Text style={[styles.drop, { color: colors.text }]}>
                  "Lahore "
                </Text>
              </View>
            </View>

            <Text
              style={{
                paddingTop: windowHeight(5),
                fontSize: windowHeight(14),
              }}
            >
              Distance: 45 km
            </Text>
            <Text
              style={{
                paddingVertical: windowHeight(5),
                paddingBottom: windowHeight(5),
                fontSize: windowHeight(14),
              }}
            >
              Amount: 135 BDT
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: windowHeight(5),
              }}
            >
              <Button
                title="Decline"
                onPress={handleClose}
                width={windowWidth(120)}
                height={windowHeight(30)}
                backgroundColor="crimson"
              />
              <Button
                title="Accept"
                onPress={() => acceptRideHandler()}
                width={windowWidth(120)}
                height={windowHeight(30)}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeSecreen;
