import { colors, radius } from "@/constants/theme";
import { getAvatarPath } from "@/services/imageService";
import { AvatarProps } from "@/types";
import { verticalScale } from "@/Utils/styling";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

const Avatar = ({
  uri,
  size = 40,
  style,
  isGroup = false,
  showOnline = false,
}: AvatarProps & { showOnline?: boolean }) => {
  return (
    <View style={{ position: "relative", alignSelf: "center" }}>
      <View
        style={[
          styles.avatar,
          { height: verticalScale(size), width: verticalScale(size) },
          style,
        ]}
      >
        <Image
          style={{ flex: 1 }}
          source={getAvatarPath(uri, isGroup)}
          contentFit="cover"
          transition={100}
        />
      </View>
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: verticalScale(size * 0.27),
              height: verticalScale(size * 0.27),
              borderRadius: verticalScale(size * 0.27) / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral200,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral100,
    overflow: "hidden",
  },
  onlineDot: {
    position: "absolute",
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
