import Avatar from "@/components/Avatar";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import { getAvatarPath, uploadFileToCloudinary } from "@/services/imageService";
import { createStory, getStories, viewStory } from "@/socket/socketEvents";
import { verticalScale } from "@/Utils/styling";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type StoryItem = {
  _id: string;
  media: string;
  mediaType: "image" | "text";
  caption?: string;
  backgroundColor?: string;
  viewers: string[];
  createdAt: string;
};

type StoryGroup = {
  user: { _id: string; name: string; avatar: string };
  stories: StoryItem[];
  hasUnread: boolean;
};

const BG_COLORS = [
  "#facc15",
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f97316",
  "#ec4899",
  "#1c1917",
];

const Stories = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressTimer = useRef<any>(null);

  // creator state
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorMode, setCreatorMode] = useState<"image" | "text">("text");
  const [storyText, setStoryText] = useState("");
  const [storyCaption, setStoryCaption] = useState("");
  const [selectedBg, setSelectedBg] = useState(BG_COLORS[0]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handleStories = (res: any) => {
      setLoading(false);
      if (res.success) setStoryGroups(res.data);
    };
    getStories(handleStories);
    getStories({});
    return () => getStories(handleStories, true);
  }, []);

  // ── story progress bar ────────────────────────────────────────────────────
  const startProgress = () => {
    progressAnim.setValue(0);
    if (progressTimer.current) progressTimer.current.stop();
    progressTimer.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    });
    progressTimer.current.start(({ finished }: { finished: boolean }) => {
      if (finished) goNextStory();
    });
  };

  const stopProgress = () => {
    if (progressTimer.current) progressTimer.current.stop();
  };

  useEffect(() => {
    if (viewerOpen && activeGroup) {
      startProgress();
      const story = activeGroup.stories[activeStoryIndex];
      if (story) viewStory({ storyId: story._id });
    }
    return () => stopProgress();
  }, [viewerOpen, activeGroup, activeStoryIndex]);

  const openViewer = (group: StoryGroup) => {
    setActiveGroup(group);
    setActiveStoryIndex(0);
    setViewerOpen(true);
  };

  const goNextStory = () => {
    if (!activeGroup) return;
    if (activeStoryIndex < activeGroup.stories.length - 1) {
      setActiveStoryIndex((i) => i + 1);
    } else {
      // find next group
      const currentIdx = storyGroups.findIndex(
        (g) => g.user._id === activeGroup.user._id,
      );
      if (currentIdx < storyGroups.length - 1) {
        setActiveGroup(storyGroups[currentIdx + 1]);
        setActiveStoryIndex(0);
      } else {
        setViewerOpen(false);
      }
    }
  };

  const goPrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((i) => i - 1);
    } else {
      setViewerOpen(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (h >= 1) return `${h}h ago`;
    if (m >= 1) return `${m}m ago`;
    return "just now";
  };

  // ── story creator ─────────────────────────────────────────────────────────
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setCreatorMode("image");
    }
  };

  const handlePostStory = async () => {
    if (creatorMode === "text" && !storyText.trim()) {
      Alert.alert("Story", "Please write something");
      return;
    }
    setUploading(true);

    if (creatorMode === "image" && selectedImage?.uri) {
      const res = await uploadFileToCloudinary(selectedImage, "stories");
      setUploading(false);
      if (res.success) {
        createStory({
          media: res.data,
          mediaType: "image",
          caption: storyCaption,
          backgroundColor: selectedBg,
        });
      }
    } else {
      setUploading(false);
      createStory({
        media: storyText.trim(),
        mediaType: "text",
        caption: storyCaption,
        backgroundColor: selectedBg,
      });
    }

    setCreatorOpen(false);
    setStoryText("");
    setStoryCaption("");
    setSelectedImage(null);
    setCreatorMode("text");

    // Refresh stories
    setTimeout(() => getStories({}), 500);
  };

  const myGroup = storyGroups.find((g) => g.user._id === user?.id);
  const otherGroups = storyGroups.filter((g) => g.user._id !== user?.id);
  const activeStory = activeGroup?.stories[activeStoryIndex];

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
          Status
        </Typo>
        <View style={{ width: verticalScale(22) }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* My story */}
        <Typo
          size={12}
          color={colors.neutral400}
          fontWeight="600"
          style={styles.sectionLabel}
        >
          MY STATUS
        </Typo>
        <TouchableOpacity
          style={styles.myStoryRow}
          onPress={() => (myGroup ? openViewer(myGroup) : setCreatorOpen(true))}
          activeOpacity={0.8}
        >
          <View style={styles.myAvatarWrap}>
            <Avatar uri={getAvatarPath(user?.avatar)} size={52} />
            <View style={styles.addBadge}>
              <Icons.Plus
                size={verticalScale(14)}
                color={colors.black}
                weight="bold"
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Typo size={15} fontWeight="600">
              My Status
            </Typo>
            <Typo size={13} color={colors.neutral500}>
              {myGroup
                ? `${myGroup.stories.length} update${myGroup.stories.length > 1 ? "s" : ""}`
                : "Tap to add status"}
            </Typo>
          </View>
          <TouchableOpacity
            style={styles.addStoryBtn}
            onPress={() => setCreatorOpen(true)}
          >
            <Icons.PencilSimpleLine
              size={verticalScale(18)}
              color={colors.primaryDark}
              weight="bold"
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Recent updates */}
        {otherGroups.length > 0 && (
          <>
            <Typo
              size={12}
              color={colors.neutral400}
              fontWeight="600"
              style={styles.sectionLabel}
            >
              RECENT UPDATES
            </Typo>
            {otherGroups.map((group) => (
              <TouchableOpacity
                key={group.user._id}
                style={styles.storyRow}
                onPress={() => openViewer(group)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.storyRing,
                    group.hasUnread
                      ? styles.storyRingUnread
                      : styles.storyRingSeen,
                  ]}
                >
                  <Avatar uri={getAvatarPath(group.user.avatar)} size={46} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typo size={15} fontWeight="600">
                    {group.user.name}
                  </Typo>
                  <Typo size={13} color={colors.neutral500}>
                    {formatTimeAgo(group.stories[0]?.createdAt)}
                  </Typo>
                </View>
                <Icons.CaretRight
                  size={verticalScale(16)}
                  color={colors.neutral300}
                />
              </TouchableOpacity>
            ))}
          </>
        )}

        {otherGroups.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Icons.Question
              size={verticalScale(48)}
              color={colors.neutral300}
            />
            <Typo
              size={14}
              color={colors.neutral400}
              style={{ marginTop: spacingY._10 }}
            >
              No status updates yet
            </Typo>
          </View>
        )}

        <View style={{ height: spacingY._40 }} />
      </ScrollView>

      {/* ── Story Viewer Modal ── */}
      <Modal visible={viewerOpen} animationType="fade" statusBarTranslucent>
        {activeGroup && activeStory && (
          <View style={styles.viewerContainer}>
            {/* Story content */}
            {activeStory.mediaType === "image" ? (
              <Image
                source={{ uri: activeStory.media }}
                style={styles.viewerImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.viewerTextBg,
                  {
                    backgroundColor:
                      activeStory.backgroundColor || colors.primary,
                  },
                ]}
              >
                <Typo
                  size={28}
                  fontWeight="700"
                  color={colors.white}
                  style={{
                    textAlign: "center",
                    paddingHorizontal: spacingX._20,
                  }}
                >
                  {activeStory.media}
                </Typo>
              </View>
            )}

            {/* Dark overlay at top + bottom */}
            <View style={styles.viewerTopGradient} />
            <View style={styles.viewerBottomGradient} />

            {/* Progress bars */}
            <View style={styles.progressRow}>
              {activeGroup.stories.map((_, i) => (
                <View key={i} style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width:
                          i < activeStoryIndex
                            ? "100%"
                            : i === activeStoryIndex
                              ? progressAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ["0%", "100%"],
                                })
                              : "0%",
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Header */}
            <View style={styles.viewerHeader}>
              <Avatar uri={getAvatarPath(activeGroup.user.avatar)} size={36} />
              <View style={{ flex: 1 }}>
                <Typo size={14} fontWeight="700" color={colors.white}>
                  {activeGroup.user._id === user?.id
                    ? "My Status"
                    : activeGroup.user.name}
                </Typo>
                <Typo size={11} color="rgba(255,255,255,0.7)">
                  {formatTimeAgo(activeStory.createdAt)}
                </Typo>
              </View>
              <TouchableOpacity
                onPress={() => setViewerOpen(false)}
                hitSlop={10}
              >
                <Icons.X
                  size={verticalScale(22)}
                  color={colors.white}
                  weight="bold"
                />
              </TouchableOpacity>
            </View>

            {/* Caption */}
            {activeStory.caption ? (
              <View style={styles.captionBox}>
                <Typo
                  size={14}
                  color={colors.white}
                  style={{ textAlign: "center" }}
                >
                  {activeStory.caption}
                </Typo>
              </View>
            ) : null}

            {/* Tap areas */}
            <View style={styles.tapAreas}>
              <TouchableWithoutFeedback onPress={goPrevStory}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={goNextStory}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
            </View>
          </View>
        )}
      </Modal>

      {/* ── Story Creator Modal ── */}
      <Modal visible={creatorOpen} animationType="slide" statusBarTranslucent>
        <View
          style={[styles.creatorContainer, { backgroundColor: selectedBg }]}
        >
          {/* Header */}
          <View style={styles.creatorHeader}>
            <TouchableOpacity onPress={() => setCreatorOpen(false)} hitSlop={8}>
              <Icons.X
                size={verticalScale(24)}
                color={colors.white}
                weight="bold"
              />
            </TouchableOpacity>
            <View style={styles.creatorModeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  creatorMode === "text" && styles.modeBtnActive,
                ]}
                onPress={() => setCreatorMode("text")}
              >
                <Typo
                  size={13}
                  fontWeight="600"
                  color={creatorMode === "text" ? colors.black : colors.white}
                >
                  Text
                </Typo>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  creatorMode === "image" && styles.modeBtnActive,
                ]}
                onPress={handlePickImage}
              >
                <Typo
                  size={13}
                  fontWeight="600"
                  color={creatorMode === "image" ? colors.black : colors.white}
                >
                  Photo
                </Typo>
              </TouchableOpacity>
            </View>
            <View style={{ width: verticalScale(24) }} />
          </View>

          {/* Content area */}
          <View style={styles.creatorContent}>
            {creatorMode === "image" && selectedImage ? (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.creatorPreviewImage}
                resizeMode="contain"
              />
            ) : (
              <TextInput
                value={storyText}
                onChangeText={setStoryText}
                placeholder="Type your status..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.storyTextInput}
                multiline
                maxLength={200}
                textAlign="center"
                autoFocus
              />
            )}
          </View>

          {/* Color picker */}
          {creatorMode === "text" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorPicker}
              contentContainerStyle={{
                gap: spacingX._10,
                paddingHorizontal: spacingX._20,
              }}
            >
              {BG_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selectedBg === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedBg(c)}
                />
              ))}
            </ScrollView>
          )}

          {/* Caption */}
          <View style={styles.captionInput}>
            <Icons.Pencil
              size={verticalScale(16)}
              color="rgba(255,255,255,0.7)"
            />
            <TextInput
              value={storyCaption}
              onChangeText={setStoryCaption}
              placeholder="Add a caption..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.captionTextInput}
              maxLength={100}
            />
          </View>

          {/* Post button */}
          <TouchableOpacity
            style={styles.postBtn}
            onPress={handlePostStory}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading ? (
              <Typo size={15} fontWeight="700" color={colors.black}>
                Posting...
              </Typo>
            ) : (
              <>
                <Typo size={15} fontWeight="700" color={colors.black}>
                  Post Status
                </Typo>
                <Icons.ArrowRight
                  size={verticalScale(18)}
                  color={colors.black}
                  weight="bold"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default Stories;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
  },
  scroll: { flex: 1, backgroundColor: colors.neutral50 },
  sectionLabel: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._7,
  },
  myStoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    gap: spacingX._12,
  },
  myAvatarWrap: { position: "relative" },
  addBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: verticalScale(20),
    height: verticalScale(20),
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  addStoryBtn: {
    padding: spacingY._7,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    gap: spacingX._12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  storyRing: {
    padding: 2,
    borderRadius: radius.full,
    borderWidth: 2.5,
  },
  storyRingUnread: { borderColor: colors.primary },
  storyRingSeen: { borderColor: colors.neutral300 },
  emptyState: {
    alignItems: "center",
    paddingTop: "25%",
  },

  // ── viewer ──────────────────────────────────────────────────────────────────
  viewerContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  viewerImage: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  viewerTextBg: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  viewerBottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacingX._12,
    paddingTop: spacingY._50,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  viewerHeader: {
    position: "absolute",
    top: spacingY._60,
    left: spacingX._15,
    right: spacingX._15,
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  captionBox: {
    position: "absolute",
    bottom: spacingY._40,
    left: spacingX._20,
    right: spacingX._20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: radius._12,
    padding: spacingX._15,
  },
  tapAreas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },

  // ── creator ──────────────────────────────────────────────────────────────────
  creatorContainer: {
    flex: 1,
    paddingTop: spacingY._50,
  },
  creatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
  },
  creatorModeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: radius.full,
    padding: 3,
    gap: 3,
  },
  modeBtn: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._7,
    borderRadius: radius.full,
  },
  modeBtnActive: { backgroundColor: colors.white },
  creatorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
  },
  creatorPreviewImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.5,
    borderRadius: radius._20,
  },
  storyTextInput: {
    fontSize: verticalScale(28),
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    width: "100%",
  },
  colorPicker: {
    maxHeight: verticalScale(50),
    marginBottom: spacingY._15,
  },
  colorDot: {
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: radius.full,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.white,
    transform: [{ scale: 1.15 }],
  },
  captionInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._12,
    backgroundColor: "rgba(0,0,0,0.25)",
    marginHorizontal: spacingX._20,
    borderRadius: radius._20,
    marginBottom: spacingY._15,
  },
  captionTextInput: {
    flex: 1,
    color: colors.white,
    fontSize: verticalScale(14),
  },
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
    backgroundColor: colors.primary,
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._40,
    paddingVertical: spacingY._15,
    borderRadius: radius.full,
  },
});
