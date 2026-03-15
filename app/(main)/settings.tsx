import Avatar from "@/components/Avatar";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { getAvatarPath } from "@/services/imageService";
import { verticalScale } from "@/Utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from "react-native";

const Settings = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const SectionTitle = ({ title }: { title: string }) => (
    <Typo
      size={11}
      color={colors.neutral400}
      fontWeight="600"
      style={styles.sectionTitle}
    >
      {title}
    </Typo>
  );

  const MenuItem = ({
    icon,
    label,
    sublabel,
    onPress,
    right,
    danger = false,
  }: {
    icon: React.ReactNode;
    label: string;
    sublabel?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.menuIconBox, danger && styles.menuIconDanger]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Typo
          size={14}
          fontWeight="600"
          color={danger ? colors.rose : colors.text}
        >
          {label}
        </Typo>
        {sublabel && (
          <Typo size={12} color={colors.neutral500}>
            {sublabel}
          </Typo>
        )}
      </View>
      {right ??
        (onPress && (
          <Icons.CaretRight
            size={verticalScale(15)}
            color={colors.neutral400}
          />
        ))}
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Icons.CaretLeft
            size={verticalScale(22)}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>
        <Typo size={18} fontWeight="700" color={colors.white}>
          Settings
        </Typo>
        <View style={{ width: verticalScale(22) }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push("/(main)/profileModal")}
          activeOpacity={0.8}
        >
          <Avatar uri={getAvatarPath(user?.avatar)} size={60} />
          <View style={{ flex: 1 }}>
            <Typo size={17} fontWeight="700">
              {user?.name}
            </Typo>
            <Typo size={13} color={colors.neutral500}>
              {user?.email}
            </Typo>
            <Typo size={12} color={colors.primaryDark} style={{ marginTop: 3 }}>
              Edit profile →
            </Typo>
          </View>
          <Icons.CaretRight
            size={verticalScale(18)}
            color={colors.neutral400}
          />
        </TouchableOpacity>

        {/* Notifications */}
        <SectionTitle title="NOTIFICATIONS" />
        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.Bell
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Push notifications"
            sublabel="Receive alerts for new messages"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: colors.neutral300,
                  true: colors.primaryDark,
                }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.SpeakerHigh
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Message sounds"
            sublabel="Play sound on new messages"
            right={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{
                  false: colors.neutral300,
                  true: colors.primaryDark,
                }}
                thumbColor={colors.white}
              />
            }
          />
        </View>

        {/* Privacy */}
        <SectionTitle title="PRIVACY" />
        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.Eye
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Read receipts"
            sublabel="Let others know you've seen messages"
            right={
              <Switch
                value={readReceipts}
                onValueChange={setReadReceipts}
                trackColor={{
                  false: colors.neutral300,
                  true: colors.primaryDark,
                }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.WifiHigh
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Online status"
            sublabel="Show when you're active"
            right={
              <Switch
                value={onlineStatus}
                onValueChange={setOnlineStatus}
                trackColor={{
                  false: colors.neutral300,
                  true: colors.primaryDark,
                }}
                thumbColor={colors.white}
              />
            }
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.Lock
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Blocked contacts"
            sublabel="Manage blocked users"
            onPress={() => Alert.alert("Coming soon")}
          />
        </View>

        {/* Appearance */}
        <SectionTitle title="APPEARANCE" />
        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.Palette
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Chat wallpaper"
            sublabel="Customize chat background"
            onPress={() => Alert.alert("Coming soon")}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.TextT
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Font size"
            sublabel="Adjust message text size"
            onPress={() => Alert.alert("Coming soon")}
          />
        </View>

        {/* Storage */}
        <SectionTitle title="STORAGE & DATA" />
        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.HardDrive
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Storage usage"
            sublabel="Manage cached media and files"
            onPress={() => Alert.alert("Coming soon")}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.ArrowsClockwise
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Auto-download media"
            sublabel="Download images automatically"
            onPress={() => Alert.alert("Coming soon")}
          />
        </View>

        {/* About */}
        <SectionTitle title="ABOUT" />
        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.Info
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="App version"
            sublabel="Echoo v1.0.0"
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.ShieldCheck
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Privacy policy"
            onPress={() => Alert.alert("Coming soon")}
          />
        </View>

        {/* Logout */}
        <SectionTitle title="" />
        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.SignOut
                size={verticalScale(18)}
                color={colors.rose}
                weight="fill"
              />
            }
            label="Logout"
            sublabel="Sign out of your account"
            onPress={handleLogout}
            danger
          />
        </View>

        <Typo
          size={12}
          color={colors.neutral400}
          style={{ textAlign: "center", paddingVertical: spacingY._20 }}
        >
          Made with ❤️ — Echoo
        </Typo>
        <View style={{ height: spacingY._30 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Settings;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
  },
  scroll: { flex: 1, backgroundColor: colors.neutral100 },
  sectionTitle: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._7,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: spacingX._15,
    borderRadius: radius._15,
    padding: spacingX._15,
    gap: spacingX._15,
    marginTop: spacingY._10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius._12,
    marginHorizontal: spacingX._15,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    gap: spacingX._12,
  },
  menuIconBox: {
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: radius._10,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: { backgroundColor: "#fef2f2" },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: spacingX._15 + verticalScale(36) + spacingX._12,
  },
});
