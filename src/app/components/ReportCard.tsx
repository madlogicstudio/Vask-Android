import { useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

type ReportData = {
    id: string;
    type: "maintenance" | "fuel";
    title?: string;
    amount: string;
    liters?: string;
    image: string;
    createdAt: number;
    status: string;
};

type ReportCardProps = {
    item: ReportData;
};

export default function ReportCard({
    item,
}: ReportCardProps) {

    const [showImage, setShowImage] = useState(false);

    const [isFuelLog, setIsFuelLog] = useState(false);

    useEffect(() => {
        setIsFuelLog(!!item.liters);
    }, [item.liters]);

    const [total, setTotal] = useState(0);

    const computeTotal = () => {

        const computation = (Number(item.liters) || 0) * (Number(item.amount) || 0);

        console.log("Fuel cost: ", computation);
        setTotal(computation);

    }

    useEffect(() => {

        computeTotal();

    }, [item])

    return (
        <>
            <View
                style={{
                    backgroundColor: "rgba(229, 231, 223, 0.95)",
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 12,
                    flexDirection: "row",
                    justifyContent: "space-between"
                }}
            >   
                <View style={{gap: 12, padding: 12}}>
                    {isFuelLog?  

                        <Text 
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{ color: "#455A64", fontSize: 16 }}>
                            ₱ {total}
                        </Text>
                        : 
                        <Text 
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{ color: "#455A64", fontSize: 16 }}>
                            {item.title}
                        </Text>
                    }

                    <Text style={{ color: "#455A64", fontSize: 16 }}>
                        ₱ {item.amount}
                    </Text>

                    <Pressable
                        onPress={() => setShowImage(true)}
                    >
                        <Text
                            style={{
                                color: "#455A64",
                                fontSize: 16,
                                textDecorationLine: "underline",
                                alignSelf: "flex-end" 
                            }}
                        >
                            View Receipt
                        </Text>
                    </Pressable>
                    
                </View>

                <View style={{gap: 12, padding: 12}}>

                    <Text
                        style={{
                            color: "#E5E7DF",
                            fontSize: 16,
                            paddingBlock: 6,
                            paddingInline: 18,
                            backgroundColor:
                                item.status === "approved"
                                    ? "#4D849D"
                                    : item.status === "rejected"
                                    ? "#EA7B7B"
                                    : "#F4B400",
                            borderRadius: 24,
                            textTransform: "capitalize",
                        }}
                    >
                        {item.status}
                    </Text>
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
                        source={{ uri: item.image }}
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