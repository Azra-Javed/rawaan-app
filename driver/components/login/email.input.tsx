import { Text, TextInput, View } from "react-native";

import { commonStyles } from "@/styles/common.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";

import color from "@/themes/app.colors";
import styles from "@/secreens/login/styles";

interface Props {
  width: number;
  email: string;
  setEmail: (email: string) => void;
}
export default function EmailInput({ width, email, setEmail }: Props) {
  return (
    <View>
      <Text
        style={[commonStyles.mediumTextBlack, { marginTop: windowHeight(8) }]}
      >
        Email Address
      </Text>

      <View
        style={[
          styles.emailInput,
          {
            width: width || windowWidth(700),
            borderColor: color.border,
          },
        ]}
      >
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={commonStyles.regularText}
          placeholder="Enter your email"
          placeholderTextColor={color.subtitle}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}
