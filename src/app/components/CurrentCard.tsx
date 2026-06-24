import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type VehicleType = "car" | "truck" | "motorcycle" | "van";

type CurrentCardProps = {
    vehicleType: VehicleType;
    deliveryId: string;
    distance: number;
    from: string;
    to: string;
    driverId: string;
    driverName: string
    cost: number;
    onComplete: () => void;
}

export default function CurrentCard({vehicleType, distance, deliveryId, from, to, cost, driverId, driverName, onComplete}: CurrentCardProps) {

    const vehicleIcons: Record<VehicleType, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
        car: "car",
        truck: "truck",
        motorcycle: "motorbike",
        van: "van-passenger",
    };

    return (
        <View style={{ width: "100%", backgroundColor: "rgba(69, 90, 100, 0.95)", padding: 12, borderRadius: 12, position: "relative", marginBottom: 12 }}>

            <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start'}}>

                <MaterialCommunityIcons
                    name={vehicleIcons[vehicleType]}
                    size={64}
                    color="#ededed"
                />

                <View style={{paddingInline: 12}}>
                    <Text style={{color: "#ededed", fontSize: 16}}>{deliveryId}</Text>
                    <Text style={{color: "#ededed", fontSize: 14}}>{distance ? `${(distance / 1000).toFixed(2)} km` : "--"}</Text>
                </View>

                <View style={{position: "absolute", top: 0, right: 0, padding: 12}}>
                    <Text style={{color: "#E5E7DF", fontSize: 16, paddingBlock: 6, paddingInline: 18, backgroundColor: "#4D849D", 
                        borderRadius: 24}}>In-transit</Text>
                </View>

            </View>

            <View style={{justifyContent: "space-between", padding: 12, gap: 12}}>
                <View style={{flexDirection: "column", gap: 6}}>
                    <Text style={{color: "gray", fontSize: 14}}>From</Text>
                    <Text style={{color: "#ededed", fontSize: 16}}>{from}</Text>
                </View>
                <View style={{flexDirection: "column", gap: 6}}>
                    <Text style={{color: "gray", fontSize: 14}}>To</Text>
                    <Text style={{color: "#ededed", fontSize: 16}}>{to}</Text>
                </View>
            </View>
            
            <View style={{width: "100%", padding: 12, borderRadius: 12, backgroundColor: "#EA7B7B", marginTop: 12, marginBottom: 6}}>
            
                <Pressable onPress={onComplete}>
                    <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Complete</Text>
                </Pressable>

            </View>
            
        </View>
    )
}