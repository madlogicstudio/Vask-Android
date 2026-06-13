import { AntDesign, Feather, MaterialIcons, Octicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from "../../firebase/FireabseConfig";

type DashboardNavProps = {
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function DashboardNav({setSelectedTab}: DashboardNavProps) {

    const user = auth.currentUser;

    const askForLocationPermission = () => {
        Alert.alert(
            "Location Access Required",
            "Vask uses your location to track deliveries and allow operators to monitor your delivery progress. Do you agree to share your location?",
            [
                {
                    text: "Decline",
                    style: "cancel",
                },
                {
                    text: "Agree",
                    onPress: requestLocationPermission,
                },
            ],
            { cancelable: false }
        );
    };

    const requestLocationPermission = async () => {
        const { status } =
            await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            Alert.alert(
                "Permission Denied",
                "Vask needs you to allow location access."
            );
            return;
        }

        console.log("Location access has been enabled.");

        // Start tracking here
    };

    if (!user) {
        return (
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text>No user logged in</Text>
        </SafeAreaView>
        );
    }

    return (
        <>
            <View style={{
                    flexDirection: "row",
                    width: "100%",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    backgroundColor: "#ededed",
                    padding: 12,
                }}
            >
                <View style={{ alignItems: "center"}}>
                    <Pressable
                        style={{
                            width: 64,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={() => {
                            setSelectedTab("dashboard");
                        }}>
                        <Octicons name="home" size={24} color="#455A64" />
                    </Pressable>
                    <Text style={{color: "#455A64", marginTop: 3}}>Home</Text>
                </View>

                <View style={{ alignItems: "center" }}>
                    <Pressable
                        style={{
                            width: 64,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={() => {
                            setSelectedTab("report");
                        }}>
                        <Octicons name="report" size={24} color="#455A64" />
                    </Pressable>
                    <Text style={{color: "#455A64", marginTop: 3}}>Report</Text>
                </View>

                <View style={{flex: 1, alignItems: "center"}}>
                    <View style={{ alignItems: "center", backgroundColor: "#D6D6D6", marginTop: -80, borderRadius: 60, padding: 8}}>
                        <Pressable
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 40,
                                backgroundColor: "#455A64",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={() => {
                                setSelectedTab("start");
                                askForLocationPermission();
                            }}>
                            <AntDesign name="plus" size={32} color="#ededed" />
                        </Pressable>
                    </View> 
                </View>

                <View style={{alignItems: "center" }}>
                    <Pressable
                        style={{
                            width: 64,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={() => {
                            setSelectedTab("chat");
                        }}>
                        <MaterialIcons name="chat-bubble-outline" size={26} color="#455A64" />
                    </Pressable>
                    <Text style={{color: "#455A64", marginTop: 3}}>Chat</Text>
                </View>

                <View style={{alignItems: "center" }}>
                    <Pressable
                        style={{
                            width: 64,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={() => {
                            setSelectedTab("profile");
                        }}>
                        <Feather name="user" size={26} color="#455A64" />
                    </Pressable>
                    <Text style={{color: "#455A64", marginTop: 3}}>Profile</Text>
                </View>

            </View>
            
        </>
    )
}