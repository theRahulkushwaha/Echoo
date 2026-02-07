import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/Utils/styling";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const Welcome = () => {
  const router = useRouter();

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Typo color={colors.white} size={43} fontWeight={"900"}>
            Echoo
          </Typo>
        </View>
        <Animated.Image
          entering={FadeIn.duration(700).springify()}
          source={require("../../assets/images/welcome.png")}
          style={styles.WelcomeImage}
          resizeMode={"contain"}
        />
        <View>
          <Typo color={colors.white} size={30} fontWeight={"600"}>
            Stay connected
          </Typo>
          <Typo color={colors.white} size={30} fontWeight={"600"}>
            with your friends
          </Typo>
          <Typo color={colors.white} size={30} fontWeight={"600"}>
            and family
          </Typo>
        </View>

        <Button
          style={{ backgroundColor: colors.white }}
          onPress={() => router.push("/(auth)/register")}
        >
          <Typo size={23} fontWeight={"bold"}>
            Get Started
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: spacingX._20,
    marginVertical: spacingY._10,
  },
  Background: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  WelcomeImage: {
    height: verticalScale(300),
    aspectRatio: 1,
    alignSelf: "center",
  },
});
