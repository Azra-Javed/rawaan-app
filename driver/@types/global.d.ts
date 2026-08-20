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

type DriverType = {
  id: string;
  name: string;
  country: string;
  phone_number: string;
  email: string;
  vehicle_type: string;
  registeration_number: string;
  registeration_date: string;
  driving_license: string;
  vehicle_color: string;
  rate: string;
  ratings: number;
  totalEarning: number;
  totalRides: number;
  pendingRides: number;
  cancelRides: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
