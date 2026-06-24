import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";

type FuelLogData = {
    id: string;
    liters: string;
    amount: string;
    fuelLogImg: string;
    status: string;
};

type FuelLogCardProps = {
    item: FuelLogData;
    onDelete: (id: string) => void;
};

export default function FuelLogCard({ item, onDelete }: FuelLogCardProps) {

    const [total, setTotal] = useState(0);

    const computeTotal = () => {

        const computation = (Number(item.liters) || 0) * (Number(item.amount) || 0);

        console.log("Fuel cost: ", computation);
        setTotal(computation);

    }

    useEffect(() => {

        computeTotal();

    }, [item])

    const [showImage, setShowImage] = useState(false);

    return (
        <>
            <View
                style={{
                    backgroundColor: "#E5E7DF",
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
                            color: "#455A64",
                            fontSize: 16,
                            fontWeight: "bold",
                        }}
                    >
                        Liters: {item.liters} L
                    </Text>

                    <Text
                        style={{
                            color: "#455A64",
                            fontSize: 16,
                        }}
                    >
                        Price per Liter: ₱{item.amount}
                    </Text>

                    <Text
                        style={{
                            color: "#455A64",
                            fontSize: 16,
                        }}
                    >
                        Total Cost: ₱{total}
                    </Text>
                </View>

                <View style={{ gap: 12 }}>
                    {item.fuelLogImg !== "" && (
                        <Pressable
                            onPress={() => setShowImage(true)}
                        >
                            <Text
                                style={{
                                    color: "#E5E7DF",
                                    fontSize: 16,
                                    textDecorationLine: "underline",
                                    alignSelf: "flex-end",
                                }}
                            >
                                View Receipt
                            </Text>
                        </Pressable>
                    )}

                    <Text
                        style={{
                            color: "orange",
                            fontSize: 16,
                            alignSelf: "flex-end",
                        }}
                    >
                        {item.status}
                    </Text>

                    {/* delete */}
                    <Pressable
                        onPress={() =>
                            Alert.alert(
                                "Delete Report",
                                "Are you sure you want to delete this fuel log report?",
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
                        source={{ uri: item.fuelLogImg }}
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