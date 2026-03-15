import { Router } from "expo-router";
import { ReactNode } from "react";
import {
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  children: any | null;
  style?: TextStyle;
  textProps?: TextProps;
};

export interface UserProps {
  email: string;
  name: string;
  avatar?: string | null;
  id: string;
}

export interface UserDataProps {
  name: string;
  email: string;
  avatar?: any;
}

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
}

export interface DecodedTokenProps {
  user: UserProps;
  exp: number;
  iat: number;
}

export type AuthContextProps = {
  token: string | null;
  user: UserProps | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    avatar?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
};

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  isModal?: boolean;
  showPattern?: boolean;
  bgOpacity?: number;
};

export type ResponseProps = {
  success: boolean;
  data?: any;
  msg?: string;
};

export interface ButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export type BackButtonProps = {
  style?: ViewStyle;
  color?: string;
  iconSize?: number;
};

export type AvatarProps = {
  size?: number;
  uri: string | null;
  style?: ViewStyle;
  isGroup?: boolean;
  showOnline?: boolean; // ✅ added
};

export type HeaderProps = {
  title?: string;
  style?: ViewStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type ConversationListItemProps = {
  item: ConversationProps;
  showDivider: boolean;
  isGroup?: boolean;
  router: Router;
};

export type ConversationProps = {
  _id: string;
  type: "direct" | "group";
  avatar: string | null;
  participants: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
  }[];
  name?: string;
  lastMessage?: {
    _id: string;
    text: string;
    sender: {
      _id: string;
      name: string;
    };
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
};

export type MessageProps = {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    name: string;
    avatar: string | null;
  };
  text: string;
  image?: string | null;
  seenBy: string[];
  createdAt: string;
  updatedAt: string;
};
