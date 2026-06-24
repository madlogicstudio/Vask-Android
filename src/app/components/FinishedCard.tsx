import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type VehicleType = "car" | "truck" | "motorcycle" | "van";

type FinishedCardProps = {
    vehicleType: VehicleType;
    deliveryId: string;
    distance: number;
    from: string;
    to: string;
    cost: number;
    driverId: string;
    driverName: string;
    date?: number;
}

export default function FinishedCard({vehicleType, distance, deliveryId, from, to, cost, date}: FinishedCardProps) {

    const vehicleIcons: Record<VehicleType, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
        car: "car",
        truck: "truck",
        motorcycle: "motorbike",
        van: "van-passenger",
    };

    return (
        <View style={{ width: "100%", backgroundColor: "rgba(229, 231, 223, 0.95)", padding: 12, borderRadius: 12, position: "relative", marginBottom: 12 }}>

            <View style={{ flexDirection: "row", alignItems: 'flex-start', justifyContent: 'flex-start'}}>

                <MaterialCommunityIcons
                    name={vehicleIcons[vehicleType]}
                    size={64}
                    color="#455A64"
                />

                <View style={{padding: 12, gap: 6}}>
                    <Text style={{color: "#455A64", fontSize: 16}}>{deliveryId}</Text>
                    <Text style={{color: "#455A64", fontSize: 14}}>{distance ? `${(distance / 1000).toFixed(2)} km` : "--"}</Text>
                    <Text style={{color: "#455A64", fontSize: 14}}>{date? new Date(date).toLocaleDateString() : "Unknown date"}</Text>
                </View>

                <View style={{position: "absolute", top: 0, right: 0, padding: 12}}>
                    <Text style={{color: "#E5E7DF", fontSize: 16, paddingBlock: 6, paddingInline: 18, backgroundColor: "#4D849D", 
                        borderRadius: 24}}>Completed</Text>
                </View>

            </View>
            
        </View>
    )
}