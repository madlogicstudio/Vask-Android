import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    Text,
    View
} from "react-native";

type MaintenanceData = {
    id: string;
    description: string;
    cost: string;
    maintenanceImg: string;
    status: string
};

type MaintenanceCardProps = {
    item: MaintenanceData;
    onDelete: (id: string) => void;
};

export default function MaintenanceCard({
    item,
    onDelete,
}: MaintenanceCardProps) {

    const [showImage, setShowImage] = useState(false);

    return (
        <>
            <View
                style={{
                    backgroundColor: "#455A64",
                    padding: 16,
                    borderRadius: 12,
                    marginVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ flex: 1, gap: 12 }}>
                    <Text
                        style={{
                            color: "#E5E7DF",
                            fontSize: 16,
                            fontWeight: "bold",
                        }}
                    >
                        Description:
                    </Text>
                    <Text 
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                            color: "#E5E7DF",
                            fontSize: 16,
                        }}
                    >
                        {item.description}
                    </Text>
                    <Text style={{ color: "#E5E7DF", fontSize: 16 }}>
                        Cost: ₱{item.cost}
                    </Text>
                    
                </View>

                <View style={{gap: 12}}>
                    {item.maintenanceImg !== "" && (
                        <Pressable
                            onPress={() => setShowImage(true)}
                        >
                            <Text
                                style={{
                                    color: "#E5E7DF",
                                    fontSize: 16,
                                    textDecorationLine: "underline",
                                    alignSelf: "flex-end" 
                                }}
                            >
                                View Receipt
                            </Text>
                        </Pressable>
                    )}
                    <Text style={{ color: "orange", fontSize: 16, alignSelf: "flex-end" }}>
                        {item.status}
                    </Text>
                    
                    {/* delete */}
                    <Pressable
                        onPress={() =>
                            Alert.alert(
                                "Delete Report",
                                "Are you sure you want to delete this maintenance report?",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel",
                                    },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () => onDelete(item.id),
                                    },
                                ]
                            )
                        }
                    >
                        <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={24}
                            color="#EA7B7B"
                            style={{ alignSelf: "flex-end" }}
                        />
                    </Pressable>

                </View>   

            </View>

            <Modal
                visible={showImage}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImage(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 24,
                    }}
                >
                    <Image
                        source={{ uri: item.maintenanceImg }}
                        style={{
                            width: "100%",
                            height: 400,
                            borderRadius: 12,
                        }}
                        resizeMode="contain"
                    />

                    <Pressable
                        onPress={() => setShowImage(false)}
                        style={{
                            marginTop: 20,
                            backgroundColor: "#EA7B7B",
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 24,
                        }}
                    >
                        <Text
                            style={{
                                color: "#E5E7DF",
                                fontSize: 16,
                            }}
                        >
                            Close
                        </Text>
                    </Pressable>
                </View>
            </Modal>
        </>
    );
}