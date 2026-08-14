import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { windowHeight } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    //backgroudColor: "fff",
    paddingTop: windowHeight(23),
  },
  containerStyle: {
    backgroundColor: color.lightGray,
    ...external.pb_30,
  },
});

export default styles;
