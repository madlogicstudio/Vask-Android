import { router } from 'expo-router';
import {
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase/FireabseConfig';

export default function JoinHub() {

    const [operatorId, setOperatorId] = useState("");
    const [hubId, setHubId] = useState("");
    const [loading, setLoading] = useState(false);

    const joinHub = async () => {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            Alert.alert("Error", "No user logged in");
            return;
        }

        if (!operatorId.trim() || !hubId.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            // Check if hub exists
            const hubRef = doc(
                db,
                "operators",
                operatorId,
                "hubs",
                hubId
            );

            const hubSnap = await getDoc(hubRef);

            if (!hubSnap.exists()) {
                Alert.alert("Error", "Hub not found");
                return;
            }

            // Save hub information inside driver document
            await setDoc(
                doc(db, "drivers", firebaseUser.uid),
                {
                    operatorId,
                    hubId,
                },
                { merge: true }
            );

            Alert.alert("Success", "Joined hub successfully");
            router.replace('../dashboard');

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to join hub");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View
                style={{
                    flex: 1,
                    padding: 20,
                    justifyContent: 'center',
                    gap: 16,
                }}
            >
                <Text style={{ width: "100%", fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
                    Join a Hub
                </Text>

                <Text style={{ width: "100%", fontSize: 16, textAlign: 'center', color: "gray" }}>
                    Ask your operator for his and hub id.
                </Text>

                <Image
                    source={require("../assets/Delivery.png")}
                    style={{ width: 420, height: 420 }}
                    />

                <TextInput
                    placeholder="Operator ID"
                    value={operatorId}
                    onChangeText={setOperatorId}
                    placeholderTextColor="#455A64"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 16
                    }}
                />

                <TextInput
                    placeholder="Hub ID"
                    value={hubId}
                    onChangeText={setHubId}
                    placeholderTextColor="#455A64"
                    style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 16
                    }}
                />

                <Pressable
                    onPress={joinHub}
                    disabled={loading}
                    style={{
                        backgroundColor: '#141215',
                        padding: 15,
                        borderRadius: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 16 }}>
                        {loading ? "Joining..." : "Join Hub"}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}