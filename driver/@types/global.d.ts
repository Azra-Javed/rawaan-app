import { DimensionValue } from "react-native";

type ButtonProps = {
  title?: string;
  onPress?: () => void;
  width?: DimensionValue;
  backgroundColor?: string;
  textColor?: string;
  height?: DimensionValue;
  disabled?: boolean;
};
