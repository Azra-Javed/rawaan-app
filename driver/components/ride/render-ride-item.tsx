
import { View, Text, StyleSheet } from "react-native";
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from "@/themes/app.constant";
import color from "@/themes/app.colors";
import { rideIcons } from "@/configs/constants";

export default function RenderRideItem({
  item,
  colors,
  driver,
}: any) {
  const iconIndex = parseInt(item.id) - 1;
  const icon = rideIcons[iconIndex];

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

  const getIconBackground = () => {
    switch (item.title) {
      case "Total Earning":
        return "#FFF4DC";

      case "Cancel Ride":
        return "#FDECEA";

      case "Pending Ride":
        return "#FFF4DC";

      case "Complete Ride":
      default:
        return color.tealSoft;
    }
  };

  const getIconColor = () => {
    switch (item.title) {
      case "Total Earning":
        return "#B77900";

      case "Cancel Ride":
        return color.coral;

      case "Pending Ride":
        return "#B77900";

      case "Complete Ride":
      default:
        return color.tealDark;
    }
  };

  return (
    <View style={styles.main}>
      <View style={styles.card}>

        {/* Icon */}
        <View
          style={[
            styles.statIcon,
            {
              backgroundColor: getIconBackground(),
            },
          ]}
        >
          <View
            style={[
              styles.iconInner,
              {
                backgroundColor: getIconBackground(),
              },
            ]}
          >
            {icon}
          </View>
        </View>

        {/* Value */}
        <Text
          style={[
            styles.data,
            item.title === "Total Earning" && styles.earning,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {getValue()}
        </Text>

        {/* Label */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    width: "48.2%",
    marginBottom: windowHeight(10),
  },

  card: {
    width: "100%",

    minHeight: windowHeight(115),

    backgroundColor: color.white,

    borderRadius: 17,

    padding: windowWidth(13),

    borderWidth: 1,
    borderColor: color.border,

    justifyContent: "flex-start",

    overflow: "hidden",
  },

  /* ================= ICON ================= */

  statIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: windowHeight(10),
  },

  iconInner: {
    width: 40,
    height: 40,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= VALUE ================= */

  data: {
    color: color.textDark,

    fontFamily: "TT-Octosquares-Medium",

    fontSize: fontSizes.FONT22,

    lineHeight: windowHeight(25),

    letterSpacing: -0.5,
  },

  earning: {
    fontSize: fontSizes.FONT17,

    letterSpacing: -0.3,
  },

  /* ================= LABEL ================= */

  title: {
    marginTop: windowHeight(3),

    color: color.textMuted,

    fontFamily: "TT-Octosquares-Medium",

    fontSize: windowHeight(8.5),

    fontWeight: "800",

    letterSpacing: 1,

    textTransform: "uppercase",
  },
});

