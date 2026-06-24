import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebase/FireabseConfig";
import ChatScreen from "./components/ChatScreen";
import DashboardNav from "./components/DashboardNav";
import DashboardTab from "./components/DashboardTab";
import ProfileTab from "./components/ProfileTab";
import ReportTab from "./components/ReportTab";
import StartTab from "./components/StartTab";

export default function Dashboard() {

    const user = auth.currentUser;
    const [selectedTab, setSelectedTab] = useState("dashboard");

    if (!user) {
        return (
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text>No user logged in</Text>
        </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>

            <View style={{ flex: 1, width: "100%", backgroundColor: "#D6D6D6" }}>
                
                {selectedTab === "dashboard" && 
                    <DashboardTab setSelectedTab={setSelectedTab}/>
                }

                {selectedTab === "report" && 
                    <ReportTab setSelectedTab={setSelectedTab} />
                }

                {selectedTab === "start" && <View
                    style={{
                        flex: 1,
                        width: "100%",
                        backgroundColor: "#D6D6D6"
                    }}
                >
                    <StartTab setSelectedTab={setSelectedTab} />
                </View>}

                {selectedTab === "chat" && 
                    <ChatScreen />
                }

                {selectedTab === "profile" && 
                    <ProfileTab />
                }

            </View>

            <View style={{ alignItems: "center", justifyContent: "center" }}>

                <DashboardNav setSelectedTab={setSelectedTab} />

            </View>
            
        </SafeAreaView>
    );
}