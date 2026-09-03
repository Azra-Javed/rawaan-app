import { View, Text, StyleSheet } from "react-native";
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from "@/themes/app.constant";
import color from "@/themes/app.colors";
import { rideIcons } from "@/configs/constants";


export default function RenderRideItem({
  item, colors, driver
}: any) {

  const iconIndex =
    parseInt(item.id) - 1;

  const icon =
    rideIcons[iconIndex];

  const getValue = () => {
    switch (item.title) {
      case "Total Earning":
        return `${driver?.totalEarning ?? 0} PKR`;

      case "Complete Ride":
        return driver?.totalRides ?? 0;

      case "Pending Ride":
        return driver?.pendingRides ?? 0;

      case "Cancel Ride":
        return driver?.cancelRides ?? 0;

      default:
        return 0;
    }
  };

  return (
    <View style={styles.main}>
      <View
        style={[
          styles.card,
          {
            borderColor:
              color.ivoryLine,
            backgroundColor:
              color.white,
          },
        ]}
      >
        <View style={styles.cardTop}>
          <Text style={styles.data}>
            {getValue()}
          </Text>

          <View
            style={styles.iconContain}
          >
            {icon}
          </View>
        </View>

        <Text style={styles.title}>
          {item.title}
        </Text>
      </View>

      <View
        style={styles.bottomBorder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginVertical:
      windowHeight(5),
    marginHorizontal:
      windowWidth(5),
  },

  card: {
    minHeight:
      windowHeight(82),

    width: "100%",

    paddingHorizontal:
      windowWidth(12),

    paddingVertical:
      windowHeight(11),

    borderWidth: 1,

    borderRadius: 16,

    overflow: "hidden",
  },

  cardTop: {
    flexDirection: "row",

    alignItems:
      "center",

    justifyContent:
      "space-between",
  },

  data: {
    flex: 1,

    color:
      color.nightIndigo,

    fontFamily:
      "TT-Octosquares-Medium",

    fontSize:
      fontSizes.FONT21,
  },

  iconContain: {
    width:
      windowWidth(36),

    height:
      windowWidth(36),

    borderRadius: 11,

    justifyContent:
      "center",

    alignItems:
      "center",

    backgroundColor:
      "#0F4C4A12",

    borderWidth: 1,

    borderColor:
      color.ivoryLine,
  },

  title: {
    marginTop:
      windowHeight(10),

    fontFamily:
      "TT-Octosquares-Medium",

    fontSize:
      windowHeight(11.5),

    color:
      color.slateTeal,
  },

  bottomBorder: {
    position: "absolute",

    bottom: 0,

    left:
      windowWidth(15),

    right:
      windowWidth(15),

    height:
      windowHeight(3),

    borderRadius: 10,

    backgroundColor:
      color.routeAmber,
  },
});