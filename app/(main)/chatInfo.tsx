import Avatar from "@/components/Avatar";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { getAvatarPath } from "@/services/imageService";
import { verticalScale } from "@/Utils/styling";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ChatInfo = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { conversationId, name, isGroup, avatar, participantsJson } =
    useLocalSearchParams<{
      conversationId: string;
      name: string;
      isGroup: string;
      avatar?: string;
      participantsJson?: string;
    }>();

  const participants = participantsJson ? JSON.parse(participantsJson) : [];
  const otherUser =
    isGroup !== "true"
      ? participants.find((p: any) => p._id !== user?.id)
      : null;

  const MenuItem = ({
    icon,
    label,
    sublabel,
    onPress,
    danger = false,
  }: {
    icon: React.ReactNode;
    label: string;
    sublabel?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
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
      {onPress && (
        <Icons.CaretRight size={verticalScale(15)} color={colors.neutral400} />
      )}
    </TouchableOpacity>
  );

  const handleAudioCall = () => {
    router.push({
      pathname: "/(main)/callScreen",
      params: {
        name: name,
        avatar: avatar || "",
        isVideo: "false",
        isIncoming: "false",
      },
    });
  };

  const handleVideoCall = () => {
    router.push({
      pathname: "/(main)/callScreen",
      params: {
        name: name,
        avatar: avatar || "",
        isVideo: "true",
        isIncoming: "false",
      },
    });
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
        <Typo size={16} fontWeight="700" color={colors.white}>
          {isGroup === "true" ? "Group Info" : "Contact Info"}
        </Typo>
        <View style={{ width: verticalScale(22) }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Avatar
              uri={getAvatarPath(avatar || null, isGroup === "true")}
              size={90}
              isGroup={isGroup === "true"}
            />
            {isGroup !== "true" && <View style={styles.onlineBadge} />}
          </View>
          <Typo size={22} fontWeight="700">
            {name}
          </Typo>
          {otherUser && (
            <Typo size={14} color={colors.neutral500}>
              {otherUser.email}
            </Typo>
          )}
          {isGroup === "true" && (
            <Typo size={13} color={colors.neutral500}>
              {participants.length} members
            </Typo>
          )}
        </View>

        {/* Quick action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleAudioCall}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBg}>
              <Icons.Phone
                weight="fill"
                size={verticalScale(20)}
                color={colors.primaryDark}
              />
            </View>
            <Typo size={11} color={colors.neutral600}>
              Audio
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleVideoCall}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBg}>
              <Icons.VideoCamera
                weight="fill"
                size={verticalScale(20)}
                color={colors.primaryDark}
              />
            </View>
            <Typo size={11} color={colors.neutral600}>
              Video
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert("Coming soon")}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBg}>
              <Icons.BellSimple
                weight="fill"
                size={verticalScale(20)}
                color={colors.primaryDark}
              />
            </View>
            <Typo size={11} color={colors.neutral600}>
              Mute
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert("Coming soon")}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBg}>
              <Icons.MagnifyingGlass
                weight="bold"
                size={verticalScale(20)}
                color={colors.primaryDark}
              />
            </View>
            <Typo size={11} color={colors.neutral600}>
              Search
            </Typo>
          </TouchableOpacity>
        </View>

        {/* Group members */}
        {isGroup === "true" && participants.length > 0 && (
          <View style={styles.card}>
            <Typo
              size={12}
              color={colors.neutral400}
              fontWeight="600"
              style={styles.cardLabel}
            >
              MEMBERS
            </Typo>
            {participants.map((p: any, i: number) => (
              <View
                key={p._id || i}
                style={[
                  styles.memberRow,
                  i < participants.length - 1 && styles.memberDivider,
                ]}
              >
                <Avatar uri={getAvatarPath(p.avatar)} size={40} />
                <View style={{ flex: 1 }}>
                  <Typo size={14} fontWeight="600">
                    {p._id === user?.id ? `${p.name} (You)` : p.name}
                  </Typo>
                  <Typo size={12} color={colors.neutral500}>
                    {p.email}
                  </Typo>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Options */}
        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.BellSimpleSlash
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Mute notifications"
            sublabel="Stop receiving alerts for this chat"
            onPress={() => Alert.alert("Coming soon")}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.Export
                size={verticalScale(18)}
                color={colors.primaryDark}
                weight="fill"
              />
            }
            label="Export chat"
            sublabel="Save conversation to file"
            onPress={() => Alert.alert("Coming soon")}
          />
        </View>

        <View style={styles.card}>
          <MenuItem
            icon={
              <Icons.ProhibitInset
                size={verticalScale(18)}
                color={colors.rose}
                weight="fill"
              />
            }
            label={isGroup === "true" ? "Leave group" : "Block contact"}
            sublabel={
              isGroup === "true"
                ? "Exit this group conversation"
                : "Stop receiving messages"
            }
            onPress={() =>
              Alert.alert(
                isGroup === "true" ? "Leave Group" : "Block Contact",
                "Are you sure?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Confirm",
                    style: "destructive",
                    onPress: () => router.replace("/(main)/home"),
                  },
                ],
              )
            }
            danger
          />
          <View style={styles.divider} />
          <MenuItem
            icon={
              <Icons.Trash
                size={verticalScale(18)}
                color={colors.rose}
                weight="fill"
              />
            }
            label="Delete chat"
            sublabel="Permanently remove this conversation"
            onPress={() =>
              Alert.alert(
                "Delete Chat",
                "This will delete the entire conversation.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => router.replace("/(main)/home"),
                  },
                ],
              )
            }
            danger
          />
        </View>

        <View style={{ height: spacingY._40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ChatInfo;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
  },
  scroll: { flex: 1, backgroundColor: colors.neutral100 },
  profileSection: {
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: spacingY._25,
    gap: spacingY._7,
    marginBottom: spacingY._10,
  },
  avatarWrapper: { position: "relative", marginBottom: spacingY._5 },
  onlineBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: verticalScale(16),
    height: verticalScale(16),
    borderRadius: 10,
    backgroundColor: colors.green,
    borderWidth: 3,
    borderColor: colors.white,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    paddingVertical: spacingY._15,
    marginBottom: spacingY._10,
  },
  actionBtn: { alignItems: "center", gap: spacingY._7 },
  actionIconBg: {
    width: verticalScale(48),
    height: verticalScale(48),
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius._12,
    marginHorizontal: spacingX._15,
    marginBottom: spacingY._10,
    overflow: "hidden",
    paddingVertical: spacingY._5,
  },
  cardLabel: {
    paddingHorizontal: spacingX._15,
    paddingBottom: spacingY._7,
    paddingTop: spacingY._5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    gap: spacingX._12,
  },
  menuIcon: {
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: radius._10,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: { backgroundColor: "#fef2f2" },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._10,
    gap: spacingX._12,
  },
  memberDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: spacingX._15 + verticalScale(36) + spacingX._12,
  },
});
