import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { sendEmailVerification } from "firebase/auth";
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from "../../firebase/FireabseConfig";

export default function Verify() {

    const [loading, setLoading] = useState(false);

    const player = useVideoPlayer(require("../assets/Catronaut.mp4"), player => {
        player.loop = true;
        player.play();
    });

    const checkVerification = async () => {
        setLoading(true);

        try {
            await auth.currentUser?.reload();

            if (auth.currentUser?.emailVerified) {
            router.replace("./JoinHub");
            } else {
            alert("Your email is not verified yet.");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async () => {
        try {
            if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            alert("Verification email sent!");
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

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

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 16}}>
                <Text style={{fontSize: 24, textAlign: 'center'}}>We’ve sent a verification link to your email</Text>
                <View style={{alignItems: 'center', gap: 16}}>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>Please check your inbox (and spam folder) to continue.</Text>
                    <Text style={{fontSize: 16, textAlign: 'center'}}>Didn't receive a verification link?</Text>
                    <Pressable onPress={resendVerification}>
                        <Text
                            style={{
                            fontSize: 16,
                            textAlign: "center",
                            color: "#EA7B7B",
                            }}
                        >
                            Resend
                        </Text>
                    </Pressable>
                </View>
                <Image
                    source={require("../assets/Successful.png")}
                    style={{ width: 420, height: 420 }}
                    />
                <Pressable onPress={checkVerification}>
                    <Text
                        style={{
                        fontSize: 18,
                        textAlign: "center",
                        backgroundColor: "#455A64",
                        color: "#ededed",
                        padding: 16,
                        }}
                    >
                        I've verified my email
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}