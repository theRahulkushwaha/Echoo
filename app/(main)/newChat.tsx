import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { getAvatarPath } from "@/services/imageService";
import { getOrCreateConversation, searchUsers } from "@/socket/socketEvents";
import { UserProps } from "@/types";
import { verticalScale } from "@/Utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const NewChat = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProps[]>([]);
  const pendingUserRef = useRef<UserProps | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── search listener ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleResults = (res: any) => {
      if (res.success) setResults(res.data);
    };
    searchUsers(handleResults);
    searchUsers({ query: "" });
    return () => searchUsers(handleResults, true);
  }, []);

  // ── conversation listener — registered ONCE on mount ─────────────────────
  useEffect(() => {
    const handleConvo = (res: any) => {
      if (!res.success) return;

      const name =
        pendingUserRef.current?.name ||
        res.data.participants?.find((p: any) => p.name)?.name ||
        "Chat";

      router.replace({
        pathname: "/(main)/chatRoom",
        params: {
          conversationId: res.data._id,
          name,
          isGroup: "false",
        },
      });
    };

    getOrCreateConversation(handleConvo);
    return () => getOrCreateConversation(handleConvo, true);
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      searchUsers({ query: val });
    }, 300);
  };

  const handleSelectUser = (targetUser: UserProps) => {
    pendingUserRef.current = targetUser;
    getOrCreateConversation({ targetUserId: targetUser.id });
  };

  const renderUser = ({ item }: { item: UserProps }) => (
    <TouchableOpacity
      style={styles.userItem}
      activeOpacity={0.7}
      onPress={() => handleSelectUser(item)}
    >
      <Avatar uri={getAvatarPath(item.avatar)} size={46} />
      <View style={{ flex: 1 }}>
        <Typo size={15} fontWeight="600">
          {item.name}
        </Typo>
        <Typo size={13} color={colors.neutral500}>
          {item.email}
        </Typo>
      </View>
      <Icons.CaretRight size={verticalScale(16)} color={colors.neutral400} />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper isModal>
      <Header
        title="New Chat"
        leftIcon={
          Platform.OS === "android" && <BackButton color={colors.black} />
        }
        style={{
          paddingHorizontal: spacingX._20,
          marginVertical: spacingY._15,
        }}
      />

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by name or email..."
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

      <TouchableOpacity
        style={[styles.groupBtn, { paddingHorizontal: spacingX._20 }]}
        onPress={() => router.push("/(main)/createGroup")}
        activeOpacity={0.8}
      >
        <View style={styles.groupIcon}>
          <Icons.Users
            size={verticalScale(22)}
            color={colors.black}
            weight="bold"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Typo size={15} fontWeight="600">
            New Group
          </Typo>
          <Typo size={12} color={colors.neutral500}>
            Create a group chat
          </Typo>
        </View>
        <Icons.CaretRight size={verticalScale(16)} color={colors.neutral400} />
      </TouchableOpacity>

      <View style={[styles.sectionLabel, { paddingHorizontal: spacingX._20 }]}>
        <Typo size={12} color={colors.neutral400} fontWeight="600">
          PEOPLE
        </Typo>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id || item.email}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Typo color={colors.neutral400}>No users found</Typo>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default NewChat;

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._10,
  },
  list: { paddingHorizontal: spacingX._20 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacingY._12,
    gap: spacingX._12,
  },
  separator: { height: 1, backgroundColor: colors.neutral100 },
  empty: { alignItems: "center", paddingTop: spacingY._40 },
  groupBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
    paddingVertical: spacingY._12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
    marginBottom: spacingY._5,
  },
  groupIcon: {
    width: verticalScale(46),
    height: verticalScale(46),
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    paddingVertical: spacingY._7,
  },
});
