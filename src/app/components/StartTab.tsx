import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import DeliverModal from "./DeliverModal";
import Map from "./Map";

type StartTabProps = {
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
};

export default function StartTab({setSelectedTab}: StartTabProps) {
    
    const [mode, setMode] = useState<"pickup" | "dropoff">("pickup");
    const [showPickup, setShowPickup] = useState(true);
    const [showDropoff, setShowDropoff] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [deliveryId, setDeliveryId] = useState("");
    const [isProceed, setIsProceed] = useState(false);

    useEffect(() => {
        createDeliveryId();
    }, []);

    const createDeliveryId = () => {
        const randomPart = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        const id = `VASK${randomPart}`;

        setDeliveryId(id);
    };

    const [distance, setDistance] = useState<number | null>(null);
    const [duration, setDuration] = useState<number | null>(null);

    const [pickupCoords, setPickupCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [dropoffCoords, setDropoffCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [pickupAddress, setPickupAddress] = useState<string | null>(null);
    const [dropoffAddress, setDropoffAddress] = useState<string | null>(null);

    const handleLocationSelect = async (
        latitude: number,
        longitude: number,
        type: "pickup" | "dropoff"
    ) => {
        try {
            const results = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            const address = results[0];

            const formatted = [
                address?.name,
                address?.street,
                address?.city,
                address?.region,
            ]
                .filter(Boolean)
                .join(", ");

            const final =
                formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            if (type === "pickup") {
                setPickupCoords({ latitude, longitude });
                setPickupAddress(final);
            } else {
                setDropoffCoords({ latitude, longitude });
                setDropoffAddress(final);
            }
        } catch {
            const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

            if (type === "pickup") {
                setPickupAddress(fallback);
            } else {
                setDropoffAddress(fallback);
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>

            <Map
                mode={mode}
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                onLocationSelect={handleLocationSelect}
                setDistance={setDistance}
                setDuration={setDuration}
            />
        
            {/* Deliverymodal */}
            {isProceed && <View style={{ position: "absolute", 
                    bottom: 20,
                    left: 16,
                    right: 16,}}>
                {isProceed && <DeliverModal setIsProceed={setIsProceed} pickupAdress={pickupAddress} dropoffAddress={dropoffAddress}
                    deliveryId={deliveryId} distance={distance} setSelectedTab={setSelectedTab} />}
            </View>}

            {!isProceed && <View
                pointerEvents="box-none"
                style={{
                    position: "absolute",
                    bottom: 20,
                    left: 16,
                    right: 16,
                    gap: 12,
                }}
            >
                
                <View style={{ backgroundColor: "rgba(69, 90, 100, 0.95)", borderRadius: 16, paddingBlock: 6, paddingInline: 12, justifyContent: "center", alignItems: "center" }}>
                    <Pressable style={{width: "100%", alignItems: "center"}} onPress={() => {
                            setIsVisible((prev) => !prev);
                            }}
                        >
                        <MaterialIcons name={isVisible? "arrow-drop-down" : "arrow-drop-up"} size={24} color="#E5E7DF"/>
                    </Pressable>

                    {/* Distance & Duration */}

                    {isVisible && <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", paddingBlock: 12, paddingInline: 6}}>
                        
                        <Text style={{ color: "#E5E7DF", fontSize: 16 }}>
                            Delivery Id: {deliveryId}
                        </Text>

                        <Text style={{ color: "#E5E7DF", fontSize: 16 }}>
                            Distance: {distance ? `${(distance / 1000).toFixed(2)} km` : "--"}
                        </Text>

                        {/* <Text style={{ color: "#E5E7DF", fontSize: 16 }}>
                            Duration: {duration
                                ? `${Math.floor(duration / 60)} min ${Math.round(duration % 60)} sec`
                                : "--"}
                        </Text> */}

                    </View>}

                    {/* Pickup */}
                        
                    {isVisible && <View style={{flexDirection: "row", alignItems: "center",  backgroundColor: "#E5E7DF",
                        marginTop: 8, padding: 12, borderRadius: 12, gap: 12, width: "100%"
                    }}>
                        <Pressable onPress={() => {
                            setMode("pickup");
                            setShowPickup((prev) => !prev);
                            }}
                        >
                            <View style={{backgroundColor: mode === "dropoff" ? "#E5E7DF" : "#EA7B7B", padding: 6, borderRadius: 50,
                                borderWidth: 2, borderColor: mode === "dropoff" ? "#EA7B7B" : "#E5E7DF"
                             }}>
                                <MaterialIcons
                                    name="my-location"
                                    size={22}
                                    color= { mode === "pickup" ? "#E5E7DF" : "#EA7B7B" }
                                />
                            </View>
                        </Pressable>
                        <Text style={{ color: "#000", maxWidth: 280, fontSize: 16 }}>
                            {pickupAddress || "Click the icon and select a pickup"}
                        </Text>
                    </View>}

                    {/* Dropoff */}
                        
                    {isVisible && <View style={{flexDirection: "row", alignItems: "center",  backgroundColor: "#E5E7DF",
                        marginTop: 12, marginBottom: 6, padding: 12, borderRadius: 12, gap: 12, width: "100%"
                    }}> 
                        <Pressable onPress={() => {
                                setMode("dropoff");
                                setShowDropoff((prev) => !prev);
                            }}                         
                        >   
                            <View style={{backgroundColor: mode === "pickup" ? "#E5E7DF" : "#EA7B7B", padding: 6, borderRadius: 50,
                                borderWidth: 2, borderColor: mode === "pickup" ? "#EA7B7B" : "#E5E7DF"
                             }}>
                                <MaterialIcons
                                    name="location-pin"
                                    size={22}
                                    color= { mode === "dropoff" ? "#E5E7DF" : "#EA7B7B" }
                                />
                            </View>
                        </Pressable>   
                        <Text style={{ color: "#000", maxWidth: 280, fontSize: 16 }}>
                            {dropoffAddress || "Click the icon and select a dropoff"}
                        </Text>
                    </View>}

                    {isVisible && <View style={{width: "100%", padding: 12, borderRadius: 12, backgroundColor: "#EA7B7B", marginTop: 12, marginBottom: 6}}>

                        <Pressable style={{width: "100%"}}
                            onPress={() => setIsProceed((prev) => !prev)}>
                            <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Proceed</Text>
                        </Pressable>

                    </View>}
                    
                </View>

            </View>}
        </View>
    );
}