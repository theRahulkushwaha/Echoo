import Button from "@/components/Button";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { useAuth } from "@/contexts/authContext";
import React from "react";
import { StyleSheet } from "react-native";

const Home = () => {
  const { signOut } = useAuth();

  // useEffect(() => {
  //   const socket = getSocket();
  //   if (!socket) return;

  //   const testSocketCallbackHandler = (data: any) => {
  //     console.log("Got response from testSocket:", data);
  //   };

  //   // listen
  //   socket.on("testSocket", testSocketCallbackHandler);

  //   // emit
  //   socket.emit("testsocket", { message: "hello server" });

  //   return () => {
  //     socket.off("testSocket", testSocketCallbackHandler);
  //   };
  // }, []);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScreenWrapper>
      <Typo>Home</Typo>
      <Button onPress={handleLogout}>
        <Typo>Logout</Typo>
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
