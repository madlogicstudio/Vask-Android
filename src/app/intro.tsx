import {
    Poppins_400Regular,
    Poppins_700Bold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Intro() {

    const router = useRouter();
    const [step, setStep] = useState(3);
    
    const bike = useVideoPlayer(require("./assets/Bike.mp4"), player => {
        player.loop = true;
        player.play();
    });
    const car = useVideoPlayer(require("./assets/Car.mp4"), player => {
        player.loop = true;
        player.play();
    });
    const van = useVideoPlayer(require("./assets/Van.mp4"), player => {
        player.loop = true;
        player.play();
    });

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_700Bold,
    });

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 16}}>

            {step === 1 && <>
                <View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center"}}>
                    <VideoView
                        player={bike}
                        nativeControls={false}
                        pointerEvents="none"
                        style={{ width: 420, height: 420 }}
                    />

                    <Text style={{ fontSize: 32, marginBottom: 20, color: "#141215", fontFamily: "Poppins_700Bold", textAlign: "center" }}>
                        Smart Vehicle Management Made Simple
                    </Text>
                </View>

                <View style={{ width: "100%", justifyContent: "flex-end", alignItems: "center"}}>
                    <Pressable onPress={() => {
                        setStep(2);
                    }}
                        style={{backgroundColor: "#141215", padding: 16, borderRadius: 32, margin: 16, width: "100%" }}>
                        <Text style={{ color: "#ededed", fontSize: 16, textAlign: "center"}}>Next</Text>
                    </Pressable>
                </View>
            </>}

            {step === 2 && <>
                <View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center"}}>
                    <VideoView
                        player={car}
                        nativeControls={false}
                        pointerEvents="none"
                        style={{ width: 420, height: 420 }}
                    />

                    <Text style={{ fontSize: 32, marginBottom: 20, color: "#141215", fontFamily: "Poppins_700Bold", textAlign: "center" }}>
                        Everything You Need in One Place
                    </Text>
                </View>

                <View style={{ width: "100%", justifyContent: "flex-end", alignItems: "center"}}>
                    <Pressable onPress={() => {
                        setStep(3)
                    }}
                        style={{backgroundColor: "#141215", padding: 16, borderRadius: 32, margin: 16, width: "100%" }}>
                        <Text style={{ color: "#ededed", fontSize: 16, textAlign: "center"}}>Next</Text>
                    </Pressable>
                </View>
            </>}

            {step === 3 && <>
                <View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center"}}>
                    <VideoView
                        player={van}
                        nativeControls={false}
                        pointerEvents="none"
                        style={{ width: 420, height: 420 }}
                    />

                    <Text style={{ fontSize: 32, marginBottom: 20, color: "#141215", fontFamily: "Poppins_700Bold", textAlign: "center" }}>
                        Take Full Control of Your Vehicle
                    </Text>
                </View>

                <View style={{ width: "100%", justifyContent: "flex-end", alignItems: "center"}}>
                    <Pressable onPress={() => {
                        router.replace("./account")
                    }}
                        style={{backgroundColor: "#141215", padding: 16, borderRadius: 32, margin: 16, width: "100%" }}>
                        <Text style={{ color: "#ededed", fontSize: 16, textAlign: "center"}}>Get Started</Text>
                    </Pressable>
                </View>
            </>}
            

        </SafeAreaView>
    );
}   