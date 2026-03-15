import Avatar from "@/components/Avatar";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { useSocket } from "@/contexts/socketContext";
import { getAvatarPath, uploadFileToCloudinary } from "@/services/imageService";
import {
  emitStopTyping,
  emitTyping,
  getMessages,
  markSeen,
  onNewMessage,
  onUserStoppedTyping,
  onUserTyping,
  sendMessage,
} from "@/socket/socketEvents";
import { MessageProps } from "@/types";
import { verticalScale } from "@/Utils/styling";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ChatRoom = () => {
  const { conversationId, name, isGroup, avatar, participantsJson } =
    useLocalSearchParams<{
      conversationId: string;
      name: string;
      isGroup?: string;
      avatar?: string;
      participantsJson?: string;
    }>();
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const router = useRouter();

  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string>("");

  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  // ── animated typing dots ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isTyping) return;
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();

    animate(typingDot1, 0);
    animate(typingDot2, 150);
    animate(typingDot3, 300);

    return () => {
      typingDot1.stopAnimation();
      typingDot2.stopAnimation();
      typingDot3.stopAnimation();
      typingDot1.setValue(0);
      typingDot2.setValue(0);
      typingDot3.setValue(0);
    };
  }, [isTyping]);

  // ── socket listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleMessages = (res: any) => {
      if (!res.success) return;
      setMessages(res.data);
      // extract other user id for online status
      if (res.data.length > 0) {
        const other = res.data.find((m: any) => m.sender?._id !== user?.id);
        if (other) setOtherUserId(other.sender._id);
      }
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: false }),
        100,
      );
    };

    const handleNewMsg = (res: any) => {
      if (!res.success) return;
      if (res.data.conversationId !== conversationId) return;
      setMessages((prev) => {
        if (prev.find((m) => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      if (res.data.sender?._id !== user?.id) {
        setOtherUserId(res.data.sender._id);
      }
      markSeen({ conversationId });
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        80,
      );
    };

    const handleTyping = (data: any) => {
      if (
        data.conversationId === conversationId &&
        data.user?._id !== user?.id
      ) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data: any) => {
      if (data.conversationId === conversationId) setIsTyping(false);
    };

    getMessages(handleMessages);
    onNewMessage(handleNewMsg);
    onUserTyping(handleTyping);
    onUserStoppedTyping(handleStopTyping);

    getMessages({ conversationId, page: 1 });
    markSeen({ conversationId });

    return () => {
      getMessages(handleMessages, true);
      onNewMessage(handleNewMsg, true);
      onUserTyping(handleTyping, true);
      onUserStoppedTyping(handleStopTyping, true);
    };
  }, [conversationId]);

  const handleTextChange = (val: string) => {
    setText(val);
    emitTyping(conversationId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => emitStopTyping(conversationId),
      1500,
    );
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ conversationId, text: trimmed });
    setText("");
    emitStopTyping(conversationId);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setUploadingImage(true);
      const res = await uploadFileToCloudinary(result.assets[0], "chat");
      setUploadingImage(false);
      if (res.success && res.data) {
        sendMessage({ conversationId, text: "", image: res.data });
      }
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ── message bubble ────────────────────────────────────────────────────────
  const renderMessage = ({
    item,
    index,
  }: {
    item: MessageProps;
    index: number;
  }) => {
    const isMe = item.sender?._id === user?.id;
    const prevMsg = messages[index - 1];
    const nextMsg = messages[index + 1];

    const isFirstInGroup = prevMsg?.sender?._id !== item.sender?._id;
    const isLastInGroup = nextMsg?.sender?._id !== item.sender?._id;

    // date separator
    const currDate = new Date(item.createdAt).toDateString();
    const prevDate =
      index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
    const showDate = currDate !== prevDate;

    return (
      <>
        {showDate && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <View style={styles.datePill}>
              <Typo size={11} color={colors.neutral500} fontWeight="600">
                {formatDateLabel(item.createdAt)}
              </Typo>
            </View>
            <View style={styles.dateLine} />
          </View>
        )}

        <View
          style={[
            styles.msgRow,
            isMe ? styles.msgRowMe : styles.msgRowOther,
            { marginBottom: isLastInGroup ? spacingY._7 : 2 },
          ]}
        >
          {/* Avatar — only show for last message in a group from others */}
          {!isMe && (
            <View style={styles.avatarSlot}>
              {isLastInGroup ? (
                <Avatar uri={getAvatarPath(item.sender?.avatar)} size={30} />
              ) : null}
            </View>
          )}

          <View style={{ maxWidth: "75%", gap: 3 }}>
            {/* Sender name for group chats */}
            {!isMe && isFirstInGroup && isGroup === "true" && (
              <Typo
                size={11}
                color={colors.primaryDark}
                fontWeight="600"
                style={{ paddingLeft: spacingX._5 }}
              >
                {item.sender?.name}
              </Typo>
            )}

            {/* Bubble */}
            <View
              style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.otherBubble,
                isMe
                  ? {
                      borderBottomRightRadius: isLastInGroup
                        ? radius._3
                        : radius._20,
                      borderTopRightRadius: isFirstInGroup
                        ? radius._20
                        : radius._6,
                    }
                  : {
                      borderBottomLeftRadius: isLastInGroup
                        ? radius._3
                        : radius._20,
                      borderTopLeftRadius: isFirstInGroup
                        ? radius._20
                        : radius._6,
                    },
              ]}
            >
              {/* Image */}
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.msgImage}
                  resizeMode="cover"
                />
              ) : null}

              {/* Text */}
              {item.text ? (
                <Typo
                  size={15}
                  color={colors.neutral900}
                  style={styles.msgText}
                >
                  {item.text}
                </Typo>
              ) : null}

              {/* Time + seen */}
              <View style={styles.msgMeta}>
                <Typo
                  size={10}
                  color={isMe ? colors.neutral600 : colors.neutral400}
                >
                  {formatTime(item.createdAt)}
                </Typo>
                {isMe && (
                  <Icons.CheckCircle
                    size={verticalScale(11)}
                    color={
                      item.seenBy?.length > 1
                        ? colors.primaryDark
                        : colors.neutral400
                    }
                    weight={item.seenBy?.length > 1 ? "fill" : "regular"}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </>
    );
  };

  // ── typing indicator bubble ───────────────────────────────────────────────
  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View
        style={[
          styles.msgRow,
          styles.msgRowOther,
          { marginBottom: spacingY._7 },
        ]}
      >
        <View style={styles.avatarSlot} />
        <View style={[styles.bubble, styles.otherBubble, styles.typingBubble]}>
          {[typingDot1, typingDot2, typingDot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
            />
          ))}
        </View>
      </View>
    );
  };

  const online = isUserOnline(otherUserId);

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <Icons.CaretLeft
              size={verticalScale(22)}
              color={colors.white}
              weight="bold"
            />
          </TouchableOpacity>

          {/* ✅ Tap header to open chat info */}
          <TouchableOpacity
            style={styles.headerInfo}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/(main)/chatInfo",
                params: {
                  conversationId,
                  name,
                  isGroup: isGroup || "false",
                  avatar: avatar || "",
                  participantsJson: participantsJson || "[]",
                },
              })
            }
          >
            <View style={{ position: "relative" }}>
              <Avatar
                uri={getAvatarPath(avatar || null, isGroup === "true")}
                size={36}
                isGroup={isGroup === "true"}
              />
              {isGroup !== "true" && online && (
                <View style={styles.onlineDotHeader} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Typo
                size={15}
                fontWeight="700"
                color={colors.white}
                textProps={{ numberOfLines: 1 }}
              >
                {name}
              </Typo>
              {isTyping ? (
                <Typo size={11} color={colors.primaryLight}>
                  typing...
                </Typo>
              ) : isGroup !== "true" && online ? (
                <Typo size={11} color={colors.primaryLight}>
                  online
                </Typo>
              ) : (
                <Typo size={11} color={colors.neutral400}>
                  {isGroup === "true" ? "tap for group info" : "tap for info"}
                </Typo>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerAction} hitSlop={8}>
            <Icons.DotsThreeVertical
              size={verticalScale(20)}
              color={colors.white}
              weight="bold"
            />
          </TouchableOpacity>
        </View>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListFooterComponent={renderTypingIndicator}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <View style={styles.emptyChatIcon}>
                  <Icons.ChatTeardropDots
                    size={verticalScale(40)}
                    color={colors.primary}
                    weight="fill"
                  />
                </View>
                <Typo size={15} fontWeight="600" color={colors.neutral700}>
                  No messages yet
                </Typo>
                <Typo
                  size={13}
                  color={colors.neutral400}
                  style={{ textAlign: "center" }}
                >
                  Say hi to {name}! 👋
                </Typo>
              </View>
            }
          />
        </View>

        {/* ── Input Bar ───────────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          {/* Image attach */}
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handlePickImage}
            disabled={uploadingImage}
            hitSlop={6}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icons.ImageSquare
                size={verticalScale(24)}
                color={colors.neutral500}
                weight="regular"
              />
            )}
          </TouchableOpacity>

          {/* Text input */}
          <TextInput
            value={text}
            onChangeText={handleTextChange}
            placeholder="Message..."
            placeholderTextColor={colors.neutral400}
            style={styles.textInput}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />

          {/* Send / mic */}
          {text.trim() ? (
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              <Icons.PaperPlaneRight
                size={verticalScale(20)}
                color={colors.black}
                weight="fill"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.sendBtn, styles.micBtn]}
              hitSlop={6}
            >
              <Icons.Microphone
                size={verticalScale(20)}
                color={colors.neutral500}
                weight="regular"
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  // ── header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    gap: spacingX._10,
  },
  backBtn: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  onlineDotHeader: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: verticalScale(10),
    height: verticalScale(10),
    borderRadius: 10,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.neutral900,
  },
  headerAction: {
    padding: 4,
  },

  // ── messages ──────────────────────────────────────────────────────────────
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  messagesList: {
    paddingHorizontal: spacingX._12,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._10,
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacingX._7,
  },
  msgRowMe: {
    justifyContent: "flex-end",
  },
  msgRowOther: {
    justifyContent: "flex-start",
  },
  avatarSlot: {
    width: verticalScale(30),
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bubble: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    borderRadius: radius._20,
    gap: 2,
  },
  myBubble: {
    backgroundColor: colors.myBubble,
  },
  otherBubble: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  msgText: {
    lineHeight: verticalScale(21),
  },
  msgImage: {
    width: verticalScale(200),
    height: verticalScale(200),
    borderRadius: radius._12,
    marginBottom: 4,
  },
  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-end",
    marginTop: 1,
  },

  // ── typing indicator ──────────────────────────────────────────────────────
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
    minWidth: verticalScale(60),
  },
  typingDot: {
    width: verticalScale(7),
    height: verticalScale(7),
    borderRadius: 10,
    backgroundColor: colors.neutral400,
  },

  // ── date separator ────────────────────────────────────────────────────────
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacingY._12,
    gap: spacingX._10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral200,
  },
  datePill: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    backgroundColor: colors.neutral100,
    borderRadius: radius.full,
  },

  // ── empty state ───────────────────────────────────────────────────────────
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "40%",
    gap: spacingY._7,
  },
  emptyChatIcon: {
    width: verticalScale(72),
    height: verticalScale(72),
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacingY._7,
  },

  // ── input bar ─────────────────────────────────────────────────────────────
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacingX._7,
    paddingHorizontal: spacingX._12,
    paddingTop: spacingY._10,
    paddingBottom: Platform.OS === "ios" ? spacingY._25 : spacingY._12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  attachBtn: {
    height: verticalScale(44),
    width: verticalScale(36),
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    minHeight: verticalScale(44),
    maxHeight: verticalScale(120),
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius._20,
    paddingHorizontal: spacingX._15,
    paddingTop: Platform.OS === "ios" ? spacingY._12 : spacingY._10,
    paddingBottom: spacingY._10,
    backgroundColor: colors.neutral100,
    color: colors.text,
    fontSize: verticalScale(15),
    lineHeight: verticalScale(20),
  },
  sendBtn: {
    height: verticalScale(44),
    width: verticalScale(44),
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  micBtn: {
    backgroundColor: colors.neutral100,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
});
