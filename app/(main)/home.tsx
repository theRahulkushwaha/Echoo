import Avatar from "@/components/Avatar";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { useSocket } from "@/contexts/socketContext";
import { getAvatarPath } from "@/services/imageService";
import {
  getConversations,
  onConversationUpdated,
  onNewMessage,
} from "@/socket/socketEvents";
import { ConversationProps } from "@/types";
import { verticalScale } from "@/Utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(() => {
    setLoading(true);
    getConversations({});
  }, []);

  useEffect(() => {
    const handleConversations = (res: any) => {
      setLoading(false);
      if (res.success) setConversations(res.data);
    };
    const handleRefresh = () => fetchConversations();

    getConversations(handleConversations);
    onNewMessage(handleRefresh);
    onConversationUpdated(handleRefresh);

    fetchConversations();

    return () => {
      getConversations(handleConversations, true);
      onNewMessage(handleRefresh, true);
      onConversationUpdated(handleRefresh, true);
    };
  }, []);

  const getConvoName = (item: ConversationProps) => {
    if (item.type === "group") return item.name || "Group";
    const other = item.participants.find((p) => p._id !== user?.id);
    return other?.name || "Unknown";
  };

  const getConvoAvatar = (item: ConversationProps) => {
    if (item.type === "group") return getAvatarPath(item.avatar, true);
    const other = item.participants.find((p) => p._id !== user?.id);
    return getAvatarPath(other?.avatar);
  };

  const getLastMessage = (item: ConversationProps) => {
    if (!item.lastMessage) return "No messages yet";
    const isMe = item.lastMessage.sender?._id === user?.id;
    const prefix = isMe ? "You: " : "";
    return prefix + (item.lastMessage.text || "📷 Image");
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { day: "numeric", month: "short" });
  };

  const renderItem = ({ item }: { item: ConversationProps }) => {
    const otherParticipant = item.participants.find((p) => p._id !== user?.id);
    const showOnline =
      item.type === "direct" && isUserOnline(otherParticipant?._id || "");

    return (
      <TouchableOpacity
        style={styles.convoItem}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/(main)/chatRoom",
            params: {
              conversationId: item._id,
              name: getConvoName(item),
              isGroup: item.type === "group" ? "true" : "false",
              avatar: item.avatar || "",
              participantsJson: JSON.stringify(item.participants),
            },
          })
        }
      >
        <Avatar
          uri={getConvoAvatar(item)}
          size={50}
          isGroup={item.type === "group"}
          showOnline={showOnline}
        />
        <View style={styles.convoContent}>
          <View style={styles.convoHeader}>
            <Typo
              size={15}
              fontWeight="600"
              style={{ flex: 1 }}
              textProps={{ numberOfLines: 1 }}
            >
              {getConvoName(item)}
            </Typo>
            <View style={styles.convoMeta}>
              <Typo size={12} color={colors.neutral400}>
                {formatTime(item.updatedAt)}
              </Typo>
              {(item.unreadCount ?? 0) > 0 && (
                <View style={styles.badge}>
                  <Typo size={11} color={colors.black} fontWeight="700">
                    {item.unreadCount! > 99 ? "99+" : item.unreadCount}
                  </Typo>
                </View>
              )}
            </View>
          </View>
          <Typo
            size={13}
            color={colors.neutral500}
            textProps={{ numberOfLines: 1 }}
          >
            {getLastMessage(item)}
          </Typo>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Typo size={24} fontWeight="800" color={colors.white}>
              Echoo
            </Typo>
            <Typo size={13} color={colors.neutral300}>
              Welcome, {user?.name}
            </Typo>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/(main)/settings")}
            >
              <Icons.GearSix
                color={colors.white}
                weight="fill"
                size={verticalScale(22)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/(main)/stories")}
            >
              <Icons.CheckCircle
                color={colors.white}
                weight="fill"
                size={verticalScale(22)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.avatarBtn]}
              onPress={() => router.push("/(main)/profileModal")}
            >
              <Avatar uri={getAvatarPath(user?.avatar)} size={34} />
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <View style={styles.content}>
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchConversations}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            contentContainerStyle={
              conversations.length === 0
                ? styles.emptyContainer
                : styles.listContent
            }
            ListEmptyComponent={
              !loading ? (
                <View style={styles.empty}>
                  <Icons.ChatCenteredDots
                    size={verticalScale(60)}
                    color={colors.neutral300}
                  />
                  <Typo
                    size={16}
                    color={colors.neutral400}
                    style={{ marginTop: spacingY._10 }}
                  >
                    No conversations yet
                  </Typo>
                  <Typo size={13} color={colors.neutral400}>
                    Start a new chat below
                  </Typo>
                </View>
              ) : null
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(main)/newChat")}
        activeOpacity={0.85}
      >
        <Icons.PencilSimpleLine
          size={verticalScale(22)}
          color={colors.black}
          weight="bold"
        />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  iconBtn: {
    padding: spacingY._7,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  avatarBtn: {
    padding: 2,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    overflow: "hidden",
  },
  listContent: { paddingTop: spacingY._10 },
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "30%",
  },
  convoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    gap: spacingX._12,
  },
  convoContent: { flex: 1, gap: 4 },
  convoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  convoMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  badge: {
    minWidth: verticalScale(20),
    height: verticalScale(20),
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: spacingX._20 + verticalScale(50) + spacingX._12,
  },
  fab: {
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(24),
    height: verticalScale(56),
    width: verticalScale(56),
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
