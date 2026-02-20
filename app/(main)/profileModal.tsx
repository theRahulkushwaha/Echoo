import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import Input from "@/components/Input";
// import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { verticalScale } from "@/Utils/styling";
// import { Button } from "@react-navigation/elements";
import Button from "@/components/Button";
import { updateProfile } from "@/socket/socketEvents";
import { UserDataProps } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";

import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileModal = () => {
  const { user, signOut, updateToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [userData, setUserData] = useState<UserDataProps>({
    name: "",
    email: "",
    avatar: null,
  });

  /**
   * Register socket listener
   */
  useEffect(() => {
    updateProfile(processUpdateProfile);

    return () => {
      updateProfile(processUpdateProfile, true);
    };
  }, []);

  /**
   * Handle server response
   */
  const processUpdateProfile = (res: any) => {
    console.log("got res:", res);
    setLoading(false);

    if (res.success) {
      updateToken(res.data.token);
      router.back();
    } else {
      Alert.alert("User", res.msg);
    }
  };

  /**
   * Sync user data from context
   */
  useEffect(() => {
    setUserData({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar,
    });
  }, [user]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setUserData({ ...userData, avatar: result.assets[0] });
    }
  };

  /**
   * Logout
   */
  const handleLogout = async () => {
    router.back();
    await signOut();
  };

  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: handleLogout,
        style: "destructive",
      },
    ]);
  };

  /**
   * Submit Update
   */
  const onSubmit = () => {
    const { name, avatar } = userData;

    if (!name.trim()) {
      Alert.alert("User", "Please enter your name");
      return;
    }

    setLoading(true);

    updateProfile({
      name: name.trim(),
      avatar,
    });
  };

  return (
    <ScreenWrapper isModal>
      <View style={styles.container}>
        <Header
          title="Update Profile"
          leftIcon={
            Platform.OS === "android" && <BackButton color={colors.black} />
          }
          style={{ marginVertical: spacingX._15 }}
        />

        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Avatar uri={userData.avatar} size={170} />

            <TouchableOpacity style={styles.editIcon} onPress={onPickImage}>
              <Icons.Pencil
                size={verticalScale(20)}
                color={colors.neutral800}
              />
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacingY._20 }}>
            <View style={styles.inputContainer}>
              <Typo style={{ paddingLeft: spacingX._10 }}>Name</Typo>

              <Input
                value={userData.name}
                containerStyle={{
                  borderColor: colors.neutral350,
                  paddingLeft: spacingX._20,
                  backgroundColor: colors.neutral300,
                }}
                onChangeText={(value) =>
                  setUserData({ ...userData, name: value })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Typo style={{ paddingLeft: spacingX._10 }}>Email</Typo>

              <Input
                value={userData.email}
                editable={false}
                containerStyle={{
                  borderColor: colors.neutral350,
                  paddingLeft: spacingX._20,
                  backgroundColor: colors.neutral300,
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {!loading && (
          <Button
            style={{
              backgroundColor: colors.rose,
              height: verticalScale(56),
              width: verticalScale(56),
            }}
            onPress={showLogoutAlert}
          >
            <Icons.SignOut
              size={verticalScale(30)}
              color={colors.white}
              weight="bold"
            />
          </Button>
        )}

        <Button style={{ flex: 1 }} onPress={onSubmit} loading={loading}>
          <Typo color={colors.black} fontWeight="700">
            Update
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
    // paddingVertical: spacingY._30,
  },

  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingY._20,
    gap: 12,
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral200,
    marginBottom: spacingY._10,
    borderTopWidth: 1,
  },

  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },

  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },

  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },

  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },

  inputContainer: {
    gap: spacingY._7,
  },
});
