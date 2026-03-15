import { getSocket } from "@/socket/socket";
import {
  joinMyRooms,
  onUserOffline,
  onUserOnline,
} from "@/socket/socketEvents";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authContext";

interface SocketContextProps {
  onlineUserIds: string[];
  isUserOnline: (userId: string) => boolean;
}

const SocketContext = createContext<SocketContextProps>({
  onlineUserIds: [],
  isUserOnline: () => false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    joinMyRooms();

    const handleOnline = ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) =>
        prev.includes(userId) ? prev : [...prev, userId],
      );
    };
    const handleOffline = ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
    };

    onUserOnline(handleOnline);
    onUserOffline(handleOffline);

    return () => {
      onUserOnline(handleOnline, true);
      onUserOffline(handleOffline, true);
    };
  }, [user]);

  const isUserOnline = (userId: string) => onlineUserIds.includes(userId);

  return (
    <SocketContext.Provider value={{ onlineUserIds, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
