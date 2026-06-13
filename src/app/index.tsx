import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const player = useVideoPlayer(require("./assets/Catronaut.mp4"), player => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");

        setTimeout(async () => {
          if (hasLaunched === null) {
            await AsyncStorage.setItem("hasLaunched", "true");
            router.replace("/intro");
          } else {
            router.replace("/intro");
          }

          setLoading(false);
        }, 5000); 

      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, backgroundColor: "white" }}>
        <VideoView
          player={player}
          nativeControls={false}
          pointerEvents="none"
          style={{
            height: 420,
            width: 420
          }}
        />
        <ActivityIndicator size="large" color="#455A64" style={{ transform: [{ scale: 2 }] }} />
      </SafeAreaView>
    );
  }

  return null;
}