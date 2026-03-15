import { AuthProvider } from "@/contexts/authContext";
import { SocketProvider } from "@/contexts/socketContext";
import { Stack } from "expo-router";

const StackLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="(main)/profileModal"
      options={{ presentation: "modal" }}
    />
    <Stack.Screen name="(main)/newChat" options={{ presentation: "modal" }} />
    <Stack.Screen
      name="(main)/createGroup"
      options={{ presentation: "modal" }}
    />
    <Stack.Screen
      name="(main)/chatRoom"
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="(main)/chatInfo"
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="(main)/settings"
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="(main)/stories"
      options={{ animation: "slide_from_right" }}
    />
    <Stack.Screen
      name="(main)/callScreen"
      options={{ presentation: "fullScreenModal" }}
    />
  </Stack>
);

const RootLayout = () => (
  <AuthProvider>
    <SocketProvider>
      <StackLayout />
    </SocketProvider>
  </AuthProvider>
);

export default RootLayout;
