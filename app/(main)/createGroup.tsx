import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { getAvatarPath, uploadFileToCloudinary } from "@/services/imageService";
import { createGroup, searchUsers } from "@/socket/socketEvents";
import { UserProps } from "@/types";
import { verticalScale } from "@/Utils/styling";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const CreateGroup = () => {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProps[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProps[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResults = (res: any) => {
      if (res.success) setSearchResults(res.data);
    };
    searchUsers(handleResults);
    searchUsers({ query: "" });
    return () => searchUsers(handleResults, true);
  }, []);

  useEffect(() => {
    const handleGroup = (res: any) => {
      setLoading(false);
      if (res.success) {
        router.replace({
          pathname: "/(main)/chatRoom",
          params: {
            conversationId: res.data._id,
            name: res.data.name,
            isGroup: "true",
            avatar: res.data.avatar || "",
            participantsJson: JSON.stringify(res.data.participants || []),
          },
        });
      } else {
        Alert.alert("Error", res.msg || "Could not create group");
      }
    };
    createGroup(handleGroup);
    return () => createGroup(handleGroup, true);
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchUsers({ query: val }), 300);
  };

  const toggleUser = (u: UserProps) => {
    setSelectedUsers((prev) =>
      prev.find((p) => p.id === u.id)
        ? prev.filter((p) => p.id !== u.id)
        : [...prev, u],
    );
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setGroupAvatar(result.assets[0]);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Group", "Please enter a group name");
      return;
    }
    if (selectedUsers.length < 2) {
      Alert.alert("Group", "Please select at least 2 members");
      return;
    }
    setLoading(true);
    let avatarUrl = "";
    if (groupAvatar?.uri) {
      const res = await uploadFileToCloudinary(groupAvatar, "groups");
      if (res.success) avatarUrl = res.data;
    }
    createGroup({
      name: groupName.trim(),
      memberIds: selectedUsers.map((u) => u.id),
      avatar: avatarUrl,
    });
  };

  const isSelected = (u: UserProps) =>
    !!selectedUsers.find((p) => p.id === u.id);

  const renderUser = ({ item }: { item: UserProps }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => toggleUser(item)}
      activeOpacity={0.7}
    >
      <Avatar uri={getAvatarPath(item.avatar)} size={44} />
      <View style={{ flex: 1 }}>
        <Typo size={15} fontWeight="600">
          {item.name}
        </Typo>
        <Typo size={12} color={colors.neutral500}>
          {item.email}
        </Typo>
      </View>
      <View
        style={[styles.checkbox, isSelected(item) && styles.checkboxSelected]}
      >
        {isSelected(item) && (
          <Icons.Check
            size={verticalScale(14)}
            color={colors.black}
            weight="bold"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper isModal>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Header
          title="New Group"
          leftIcon={
            Platform.OS === "android" && <BackButton color={colors.black} />
          }
          style={{
            paddingHorizontal: spacingX._20,
            marginVertical: spacingY._15,
          }}
        />

        {/* Avatar + Name row */}
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.avatarPicker}
            onPress={handlePickAvatar}
          >
            {groupAvatar ? (
              <Avatar uri={groupAvatar.uri} size={72} isGroup />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icons.Camera
                  size={verticalScale(26)}
                  color={colors.neutral500}
                />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Icons.Pencil size={verticalScale(11)} color={colors.white} />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Group name..."
              value={groupName}
              onChangeText={setGroupName}
              icon={
                <Icons.Users
                  size={verticalScale(20)}
                  color={colors.neutral500}
                />
              }
            />
          </View>
        </View>

        {/* Selected chips */}
        {selectedUsers.length > 0 && (
          <View style={styles.chipsContainer}>
            <View style={styles.chipsRow}>
              {selectedUsers.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.chip}
                  onPress={() => toggleUser(u)}
                >
                  <Avatar uri={getAvatarPath(u.avatar)} size={20} />
                  <Typo size={12} fontWeight="600">
                    {u.name?.split(" ")[0]}
                  </Typo>
                  <Icons.X size={verticalScale(11)} color={colors.neutral700} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchBox}>
          <Input
            placeholder="Search people to add..."
            value={query}
            onChangeText={handleSearch}
            icon={
              <Icons.MagnifyingGlass
                size={verticalScale(20)}
                color={colors.neutral500}
              />
            }
          />
        </View>

        <Typo
          size={12}
          color={colors.neutral400}
          fontWeight="600"
          style={{
            paddingHorizontal: spacingX._20,
            paddingBottom: spacingY._7,
          }}
        >
          {searchResults.length} PEOPLE
        </Typo>

        {/* User list */}
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />

        {/* Footer button — always visible */}
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Typo size={13} color={colors.neutral600}>
              {selectedUsers.length} selected
            </Typo>
          </View>
          <Button
            onPress={handleCreate}
            loading={loading}
            style={
              [
                styles.createBtn,
                selectedUsers.length < 2 ? styles.createBtnDisabled : undefined,
              ] as any
            }
          >
            <Typo fontWeight="700" color={colors.black} size={15}>
              Create Group
            </Typo>
            <Icons.ArrowRight
              size={verticalScale(18)}
              color={colors.black}
              weight="bold"
            />
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default CreateGroup;

const styles = StyleSheet.create({
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._15,
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._15,
  },
  avatarPicker: { position: "relative" },
  avatarPlaceholder: {
    width: verticalScale(72),
    height: verticalScale(72),
    borderRadius: radius.full,
    backgroundColor: colors.neutral200,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  chipsContainer: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacingX._7,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
  },
  searchBox: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._10,
  },
  list: {
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._10,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacingY._10,
    gap: spacingX._12,
  },
  separator: { height: 1, backgroundColor: colors.neutral100 },
  checkbox: {
    width: verticalScale(24),
    height: verticalScale(24),
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral300,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    backgroundColor: colors.white,
    gap: spacingX._12,
  },
  createBtn: {
    flexDirection: "row",
    gap: spacingX._7,
    paddingHorizontal: spacingX._20,
    height: verticalScale(48),
    width: "auto",
    borderRadius: radius.full,
  },
  createBtnDisabled: {
    backgroundColor: colors.neutral200,
  },
});
