// import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
// import React from "react";
// import { useTheme } from "@react-navigation/native";
// import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
// import fonts from "@/themes/app.fonts";
// import color from "@/themes/app.colors";
// import Images from "@/utils/images";
// import { Gps, Location, Star } from "@/utils/icons";

// export default function RideCard({ item }: { item: any }) {
//   const { colors } = useTheme();

//   return (
//     <View
//       style={[
//         styles.main,
//         { backgroundColor: colors.card, borderColor: colors.border },
//       ]}
//     >
//       <View style={[styles.top, { backgroundColor: colors.background }]}>
//         <View style={[styles.alignment, { flexDirection: "row" }]}>
//           <View style={[styles.profile, { flexDirection: "row" }]}>
//             <Image source={Images.user} style={styles.userimage} />
//             <Text style={[styles.userName, { color: colors.text }]}>
//               {item?.driver?.name}
//             </Text>
//           </View>
//           <View style={styles.rate}>
//             <Star />
//             <Text style={[styles.rating, { color: colors.text }]}>5</Text>
//             <View
//               style={[styles.verticalBorder, { borderColor: colors.border }]}
//             />
//             <Text style={styles.price}>PKR {item.charge}</Text>
//           </View>
//         </View>
//         <View style={[styles.alignment, { flexDirection: "row" }]}>
//           <Text style={styles.timing}>{item.createdAt.slice(0, 10)}</Text>
//           <View style={styles.rate}>
//             <Location color={colors.text} />
//             <Text style={[styles.distance, { color: colors.text }]}>
//               {item.distance}
//             </Text>
//           </View>
//         </View>
//       </View>
//       <View
//         style={[
//           styles.bottom,
//           styles.alignment,
//           { backgroundColor: colors.background },
//         ]}
//       >
//         <View style={{ flexDirection: "row", height: "auto" }}>
//           <View style={styles.leftView}>
//             <Location color={colors.text} />
//             <View
//               style={[styles.verticaldot, { borderColor: color.darkBorder }]}
//             />
//             <Gps colors={colors.text} />
//           </View>
//           <View style={styles.rightView}>
//             <Text style={[styles.pickup, { color: colors.text }]}>
//               {item.currentLocationName}
//             </Text>
//             <Text style={[styles.drop, { color: colors.text }]}>
//               {item.destinationLocationName}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   main: {
//     width: "100%",
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: windowWidth(5),
//     marginVertical: 5,
//   },
//   top: {
//     flex: 1,
//     marginBottom: windowHeight(1.5),
//     paddingHorizontal: windowWidth(3),
//     borderRadius: 5,
//     paddingVertical: windowHeight(5),
//   },
//   alignment: {
//     justifyContent: "space-between",
//   },
//   profile: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   userimage: {
//     height: windowHeight(35),
//     width: windowWidth(35),
//     resizeMode: "contain",
//   },
//   userName: {
//     marginHorizontal: windowWidth(5),
//     fontFamily: fonts.medium,
//     fontSize: fontSizes.FONT20,
//   },
//   rate: {
//     flexDirection: "row",
//     marginHorizontal: windowWidth(5),
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   rating: {
//     marginHorizontal: windowWidth(5),
//     fontFamily: fonts.medium,
//     fontSize: fontSizes.FONT20,
//   },
//   verticalBorder: {
//     borderLeftWidth: 1,
//     height: windowHeight(15),
//     marginHorizontal: windowWidth(5),
//   },
//   price: {
//     color: color.primary,
//     marginHorizontal: windowWidth(0.4),
//     fontFamily: fonts.bold,
//     fontSize: fontSizes.FONT20,
//   },
//   border: {
//     borderStyle: "dashed",
//     borderBottomWidth: 5,
//     borderColor: color.border,
//     marginVertical: windowHeight(1.5),
//   },
//   timing: {
//     color: color.secondaryFont,
//     fontFamily: fonts.medium,
//     fontSize: fontSizes.FONT20,
//   },
//   distance: {
//     fontFamily: fonts.medium,
//     fontSize: fontSizes.FONT18,
//   },
//   bottom: {
//     flex: 1,
//     paddingHorizontal: windowWidth(5),
//     borderRadius: 5,
//     paddingVertical: windowHeight(5),
//   },
//   leftView: {
//     marginRight: windowWidth(5),
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: windowHeight(3),
//     marginTop: windowHeight(4),
//   },
//   rightView: {
//     marginTop: windowHeight(5),
//   },
//   verticaldot: {
//     borderLeftWidth: 1,
//     height: windowHeight(20),
//     marginHorizontal: 5,
//   },
//   pickup: {
//     fontSize: fontSizes.FONT18,
//   },
//   drop: {
//     fontSize: fontSizes.FONT18,
//     paddingTop: windowHeight(20),
//   },
// });

import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";
import {
  fontSizes,
  windowHeight,
  windowWidth,
} from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import color from "@/themes/app.colors";
import Images from "@/utils/images";
import { Gps, Location, Star } from "@/utils/icons";

export default function RideCard({ item }: { item: any }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* TOP SECTION */}
      <View style={styles.topSection}>
        {/* DRIVER */}
        <View style={styles.driverSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={Images.user}
              style={styles.userImage}
            />
          </View>

          <View style={styles.driverInfo}>
            <Text
              style={[
                styles.driverName,
                { color: colors.text },
              ]}
              numberOfLines={1}
            >
              {item?.driver?.name || "Driver"}
            </Text>

            <View style={styles.ratingRow}>
              <Star />

              <Text
                style={[
                  styles.rating,
                  { color: colors.text },
                ]}
              >
               {item?.rating|| "5.0"}
              </Text>

              <View
                style={[
                  styles.ratingDivider,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />

              <Text
                style={[
                  styles.date,
                  { color: colors.text },
                ]}
              >
                {item?.createdAt
                  ? item.createdAt.slice(0, 10)
                  : "--"}
              </Text>
            </View>
          </View>
        </View>

        {/* PRICE */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>
            FARE
          </Text>

          <Text style={styles.price}>
            PKR {item?.charge ?? "0"}
          </Text>
        </View>
      </View>

      {/* DISTANCE */}
      <View
        style={[
          styles.distanceBadge,
          {
            backgroundColor:
              color.tealSoft,
          },
        ]}
      >
        <Location color={color.tealDark} />

        <Text
          style={[
            styles.distance,
            { color: color.tealDark },
          ]}
        >
          {item?.distance || "0"} km
        </Text>
      </View>

      {/* ROUTE */}
      <View
        style={[
          styles.routeCard,
          {
            backgroundColor:
              colors.card,
          },
        ]}
      >
        {/* LEFT TIMELINE */}
        <View style={styles.timeline}>
          <View style={styles.pickupDot}>
            <View style={styles.pickupDotInner} />
          </View>

          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />

          <Gps colors={color.coral} />
        </View>

        {/* LOCATIONS */}
        <View style={styles.locations}>
          {/* PICKUP */}
          <View style={styles.locationBlock}>
            <Text style={styles.locationLabel}>
              PICKUP
            </Text>

            <Text
              style={[
                styles.locationText,
                { color: colors.text },
              ]}
              numberOfLines={2}
            >
              {item?.currentLocationName ||
                "Pickup location"}
            </Text>
          </View>

          {/* DESTINATION */}
          <View style={styles.destinationBlock}>
            <Text style={styles.locationLabel}>
              DESTINATION
            </Text>

            <Text
              style={[
                styles.locationText,
                { color: colors.text },
              ]}
              numberOfLines={2}
            >
              {item?.destinationLocationName ||
                "Destination"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 18,
    padding: windowWidth(11),
    marginVertical: windowHeight(5),
  },

  /* =========================
     TOP
  ========================= */

  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatarWrapper: {
    width: windowWidth(42),
    height: windowWidth(42),
    borderRadius: 14,
    backgroundColor: color.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  userImage: {
    width: windowWidth(30),
    height: windowWidth(30),
    resizeMode: "contain",
  },

  driverInfo: {
    flex: 1,
    marginLeft: windowWidth(9),
  },

  driverName: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.FONT16,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: windowHeight(4),
  },

  rating: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT12,
    marginLeft: 4,
  },

  ratingDivider: {
    width: 1,
    height: windowHeight(12),
    marginHorizontal: windowWidth(6),
  },

  date: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT11,
  },

  /* =========================
     PRICE
  ========================= */

  priceSection: {
    alignItems: "flex-end",
    marginLeft: windowWidth(8),
  },

  priceLabel: {
    fontFamily: fonts.medium,
    fontSize: 8,
    letterSpacing: 1,
    color: color.secondaryFont,
  },

  price: {
    marginTop: 2,
    color: color.primary,
    fontFamily: fonts.bold,
    fontSize: fontSizes.FONT17,
  },

  /* =========================
     DISTANCE
  ========================= */

  distanceBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    paddingHorizontal: windowWidth(8),
    paddingVertical: windowHeight(5),
    marginTop: windowHeight(10),
  },

  distance: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT11,
    marginLeft: 4,
  },

  /* =========================
     ROUTE
  ========================= */

  routeCard: {
    flexDirection: "row",
    borderRadius: 14,
    paddingHorizontal: windowWidth(10),
    paddingVertical: windowHeight(11),
    marginTop: windowHeight(9),
  },

  timeline: {
    width: windowWidth(20),
    alignItems: "center",
    paddingTop: 2,
  },

  pickupDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: color.tealDark,
    alignItems: "center",
    justifyContent: "center",
  },

  pickupDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: color.tealDark,
  },

  timelineLine: {
    width: 1,
    height: windowHeight(25),
    marginVertical: 3,
  },

  locations: {
    flex: 1,
    marginLeft: windowWidth(7),
  },

  locationBlock: {
    marginBottom: windowHeight(9),
  },

  destinationBlock: {
    marginTop: 1,
  },

  locationLabel: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1,
    color: color.secondaryFont,
    marginBottom: 3,
  },

  locationText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.FONT12,
    lineHeight: 17,
  },
});
