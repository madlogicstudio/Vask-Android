import { AntDesign } from "@expo/vector-icons";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { auth, db } from "../../firebase/FireabseConfig";

export default function ChatScreen() {

    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [operatorId, setOperatorId] = useState("");
    const [chatId, setChatId] = useState("");
    const [hubId, setHubId] = useState("");

    useEffect(() => {
        const firebaseUser = auth.currentUser;

        if (firebaseUser) {
            setCurrentUserId(firebaseUser.uid);
        }
    }, []);

    //fetch inviteCode/operatorId
    useEffect(() => {
        const fetchOperatorId = async () => {
            const firebaseUser = auth.currentUser;

            console.log("Firebase user:", firebaseUser);

            if (!firebaseUser) {
                console.log("No firebase user");
                return;
            }

            const driverRef = doc(db, "drivers", firebaseUser.uid);

            console.log("Fetching:", firebaseUser.uid);

            const driverDoc = await getDoc(driverRef);

            console.log("Driver exists:", driverDoc.exists());

            if (driverDoc.exists()) {
                console.log("Driver data:", driverDoc.data());

                setOperatorId(driverDoc.data().operatorId);
            }
        };

        fetchOperatorId();
    }, []);

    //fetch hubId
    useEffect(() => {
        if (!operatorId) return;

        const fetchHubId = async () => {
            try {
                const snapshot = await getDocs(
                    collection(db, "operators", operatorId, "hubs")
                );

                snapshot.forEach((doc) => {
                    console.log("Hub ID:", doc.id);
                    console.log("Hub Data:", doc.data());
                });

                if (!snapshot.empty) {
                    setHubId(snapshot.docs[0].id);
                }
            } catch (error) {
                console.log("Fetch chatId error:", error);
            }
        };

        fetchHubId();
    }, [operatorId]);

    //fetch chatId
    useEffect(() => {
    if (!operatorId || !hubId) return;

        const fetchChatId = async () => {
            try {
                const snapshot = await getDocs(
                    collection(
                        db,
                        "operators",
                        operatorId,
                        "hubs",
                        hubId,
                        "chats"
                    )
                );

                console.log("Empty:", snapshot.empty);
                console.log("Size:", snapshot.size);

                snapshot.forEach((doc) => {
                    console.log("Chat ID:", doc.id);
                    console.log("Chat Data:", doc.data());
                });

                if (!snapshot.empty) {
                    setChatId(snapshot.docs[0].id);
                }
            } catch (error) {
                console.log("Fetch chatId error:", error);
            }
        };

        fetchChatId();
    }, [operatorId, hubId]);

    //sendMessage
    const sendMessage = async () => {
        if (!text.trim()) return;

        const firebaseUser = auth.currentUser;

        console.log("operatorId:", operatorId);
        console.log("chatId:", chatId);

        if (!firebaseUser) return;
        if (!operatorId) return;
        if (!hubId) return;

        try {
            await addDoc(
                collection(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "chats",
                    chatId,
                    "messages"
                ),
                {
                    text,
                    senderId: firebaseUser.uid,
                    senderType: "driver",
                    type: "text",
                    createdAt: serverTimestamp(),
                }
            );

            setText("");

        } catch (error) {
            console.log("Send message error:", error);
        }
    };

    //fetch messages
    useEffect(() => {
        if (!operatorId || !chatId || !hubId) return;

        const q = query(
            collection(
                db,
                "operators",
                operatorId,
                "hubs",
                hubId,
                "chats",
                chatId,
                "messages"
            ),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setMessages(msgs);
        });

        return unsubscribe;
    }, [operatorId, chatId]);

    //send emage
    const sendImage = async () => {
        if (!operatorId || !hubId || !chatId) return;

        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                alert("Permission required");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 0.7,
            });

            if (result.canceled) return;

            const asset = result.assets[0];

            // Convert image to Base64
            const file = new File(asset.uri);
            const base64 = await file.base64();

            // Upload to Cloudinary
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/de4i0nirw/image/upload",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        file: `data:${asset.mimeType ?? "image/jpeg"};base64,${base64}`,
                        upload_preset: "madlogicstudio_vask_image_upload",
                    }),
                }
            );

            const data = await response.json();

            console.log("Cloudinary response:", data);

            if (!data.secure_url) {
                throw new Error(
                    data.error?.message || "Cloudinary upload failed"
                );
            }

            await addDoc(
                collection(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "chats",
                    chatId,
                    "messages"
                ),
                {
                    imageUrl: data.secure_url,
                    senderId: auth.currentUser?.uid,
                    senderType: "driver",
                    type: "image",
                    createdAt: serverTimestamp(),
                }
            );

            console.log("Image sent");
        } catch (error) {
            console.log("Send image error:", error);
        }
    };

    return (
        <View style={{ flex: 1, width: "100%", padding: 12, backgroundColor: "#455A64" }}>

            <FlatList
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 10 }}
                data={messages}
                keyExtractor={(item, index) =>
                    item?.id?.toString() || index.toString()
                }

                renderItem={({ item }) => {
                    const isMe = item?.senderId === currentUserId;

                return (
                    <View
                        style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            backgroundColor:
                                item.type === "image"
                                    ? "transparent"
                                    : isMe
                                    ? "#141215"
                                    : "#e0e0e0",

                            padding:
                                item.type === "image"
                                    ? 0
                                    : 10,
                            marginVertical: 4,
                            borderRadius: 10,
                            maxWidth: "80%",
                        }}>

                        <>
                            {item.type === "image" ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        borderRadius: 10,
                                    }}
                                />
                            ) : (
                                <Text
                                    style={{
                                        color: isMe ? "white" : "black",
                                    }}
                                >
                                    {item.text}
                                </Text>
                            )}
                        </>
                    </View>
                );
            }}/>

            <View style={{
                flexDirection: "row",
                alignItems: "center",
                paddingBlock: 10,
            }}>
                <Pressable
                    onPress={sendImage}
                    style={{
                        marginRight: 16,
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                            fontSize: 24,
                        }}
                    >
                        <AntDesign name="plus" size={24} color="#ededed" />
                    </Text>
                </Pressable>

                <TextInput
                    value={text}
                    onChangeText={setText}
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 20,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        color: "white"
                    }}
                />

                <Pressable
                    onPress={sendMessage}
                    style={{
                        marginLeft: 8,
                        backgroundColor: "#141215",
                        paddingBlock: 12,
                        paddingInline: 16,
                        borderRadius: 20,
                    }}
                >
                    <Text style={{ color: "white" }}>Send</Text>
                </Pressable>

            </View>

        </View>
    );
}