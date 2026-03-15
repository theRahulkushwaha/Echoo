import Avatar from "@/components/Avatar";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { getAvatarPath } from "@/services/imageService";
import { verticalScale } from "@/Utils/styling";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");

const CallScreen = () => {
  const router = useRouter();
  const { name, avatar, isVideo, isIncoming } = useLocalSearchParams<{
    name: string;
    avatar?: string;
    isVideo?: string;
    isIncoming?: string;
  }>();

  const video = isVideo === "true";
  const incoming = isIncoming === "true";

  const [callState, setCallState] = useState<"ringing" | "connected" | "ended">(
    incoming ? "ringing" : "connected",
  );
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for ringing
  useEffect(() => {
    if (callState === "ringing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callState]);

  // Timer when connected
  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleEndCall = () => {
    setCallState("ended");
    setTimeout(() => router.back(), 1000);
  };

  const handleAccept = () => setCallState("connected");

  const handleDecline = () => {
    setCallState("ended");
    setTimeout(() => router.back(), 800);
  };

  const ActionBtn = ({
    icon,
    label,
    onPress,
    active = false,
    danger = false,
    large = false,
  }: {
    icon: React.ReactNode;
    label?: string;
    onPress: () => void;
    active?: boolean;
    danger?: boolean;
    large?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.actionWrap}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.actionBtn,
          large && styles.actionBtnLarge,
          active && styles.actionBtnActive,
          danger && styles.actionBtnDanger,
        ]}
      >
        {icon}
      </View>
      {label && (
        <Typo size={12} color="rgba(255,255,255,0.75)" style={{ marginTop: 6 }}>
          {label}
        </Typo>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Background */}
      <View
        style={[
          styles.bgOverlay,
          { backgroundColor: video ? "#0a0a0a" : colors.neutral900 },
        ]}
      />

      {/* Video placeholder (in real app, WebRTC view goes here) */}
      {video && callState === "connected" && (
        <View style={styles.videoPlaceholder}>
          <Typo size={13} color="rgba(255,255,255,0.3)">
            Camera feed (WebRTC)
          </Typo>
        </View>
      )}

      {/* Self preview (video call) */}
      {video && callState === "connected" && !cameraOff && (
        <View style={styles.selfPreview}>
          <View style={styles.selfPreviewInner}>
            <Typo size={11} color="rgba(255,255,255,0.5)">
              You
            </Typo>
          </View>
        </View>
      )}

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Avatar + pulse */}
        <View style={styles.avatarArea}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: callState === "ringing" ? 0.3 : 0,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRingInner,
              {
                transform: [{ scale: pulseAnim }],
                opacity: callState === "ringing" ? 0.15 : 0,
              },
            ]}
          />
          <Avatar uri={getAvatarPath(avatar || null)} size={100} />
        </View>

        <Typo size={26} fontWeight="700" color={colors.white}>
          {name}
        </Typo>

        {callState === "ringing" && (
          <Typo size={15} color="rgba(255,255,255,0.65)">
            {incoming
              ? `Incoming ${video ? "video" : "voice"} call...`
              : `Calling...`}
          </Typo>
        )}
        {callState === "connected" && (
          <Typo size={15} color={colors.primary}>
            {formatElapsed(elapsed)}
          </Typo>
        )}
        {callState === "ended" && (
          <Typo size={15} color={colors.neutral400}>
            Call ended
          </Typo>
        )}
      </View>

      {/* Controls */}
      {callState === "connected" && (
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <ActionBtn
              icon={
                <Icons.MicrophoneSlash
                  size={verticalScale(22)}
                  color={muted ? colors.black : colors.white}
                  weight="fill"
                />
              }
              label={muted ? "Unmute" : "Mute"}
              onPress={() => setMuted((v) => !v)}
              active={muted}
            />
            <ActionBtn
              icon={
                <Icons.SpeakerHigh
                  size={verticalScale(22)}
                  color={speakerOn ? colors.black : colors.white}
                  weight="fill"
                />
              }
              label="Speaker"
              onPress={() => setSpeakerOn((v) => !v)}
              active={speakerOn}
            />
            {video && (
              <ActionBtn
                icon={
                  <Icons.VideoCamera
                    size={verticalScale(22)}
                    color={cameraOff ? colors.black : colors.white}
                    weight="fill"
                  />
                }
                label={cameraOff ? "Cam off" : "Camera"}
                onPress={() => setCameraOff((v) => !v)}
                active={cameraOff}
              />
            )}
            <ActionBtn
              icon={
                <Icons.ChatCircle
                  size={verticalScale(22)}
                  color={colors.white}
                  weight="fill"
                />
              }
              label="Message"
              onPress={() => router.back()}
            />
          </View>

          {/* End call */}
          <ActionBtn
            icon={
              <Icons.PhoneDisconnect
                size={verticalScale(28)}
                color={colors.white}
                weight="fill"
              />
            }
            onPress={handleEndCall}
            danger
            large
          />
        </View>
      )}

      {/* Incoming call controls */}
      {callState === "ringing" && incoming && (
        <View style={styles.incomingControls}>
          <View style={styles.incomingBtn}>
            <ActionBtn
              icon={
                <Icons.PhoneX
                  size={verticalScale(28)}
                  color={colors.white}
                  weight="fill"
                />
              }
              label="Decline"
              onPress={handleDecline}
              danger
              large
            />
          </View>
          <View style={styles.incomingBtn}>
            <ActionBtn
              icon={
                video ? (
                  <Icons.VideoCamera
                    size={verticalScale(28)}
                    color={colors.black}
                    weight="fill"
                  />
                ) : (
                  <Icons.Phone
                    size={verticalScale(28)}
                    color={colors.black}
                    weight="fill"
                  />
                )
              }
              label="Accept"
              onPress={handleAccept}
              active
              large
            />
          </View>
        </View>
      )}

      {/* Outgoing ringing controls */}
      {callState === "ringing" && !incoming && (
        <View style={styles.controls}>
          <ActionBtn
            icon={
              <Icons.PhoneDisconnect
                size={verticalScale(28)}
                color={colors.white}
                weight="fill"
              />
            }
            label="Cancel"
            onPress={handleEndCall}
            danger
            large
          />
        </View>
      )}
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral900 },
  bgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  selfPreview: {
    position: "absolute",
    top: spacingY._60,
    right: spacingX._20,
    width: verticalScale(90),
    height: verticalScale(120),
    borderRadius: radius._15,
    overflow: "hidden",
    zIndex: 10,
    borderWidth: 2,
    borderColor: colors.neutral700,
  },
  selfPreviewInner: {
    flex: 1,
    backgroundColor: colors.neutral800,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacingY._12,
    paddingTop: spacingY._60,
  },
  avatarArea: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacingY._10,
  },
  pulseRing: {
    position: "absolute",
    width: verticalScale(160),
    height: verticalScale(160),
    borderRadius: verticalScale(80),
    backgroundColor: colors.primary,
  },
  pulseRingInner: {
    position: "absolute",
    width: verticalScale(200),
    height: verticalScale(200),
    borderRadius: verticalScale(100),
    backgroundColor: colors.primary,
  },
  controls: {
    alignItems: "center",
    paddingBottom: spacingY._50,
    gap: spacingY._25,
  },
  controlsRow: {
    flexDirection: "row",
    gap: spacingX._25,
    justifyContent: "center",
  },
  incomingControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: spacingY._60,
    paddingHorizontal: spacingX._40,
  },
  incomingBtn: { alignItems: "center" },
  actionWrap: { alignItems: "center" },
  actionBtn: {
    width: verticalScale(56),
    height: verticalScale(56),
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnLarge: {
    width: verticalScale(68),
    height: verticalScale(68),
  },
  actionBtnActive: {
    backgroundColor: colors.primary,
  },
  actionBtnDanger: {
    backgroundColor: colors.rose,
  },
});
