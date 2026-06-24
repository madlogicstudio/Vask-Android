import { auth, db } from '@/firebase/FireabseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { SetStateAction, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type DeliverModalProps = {
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
    setIsProceed: React.Dispatch<SetStateAction<boolean>>;
    pickupAdress: any;
    dropoffAddress: any;
    deliveryId: any;
    distance: any;
}

export default function DeliverModal({setIsProceed, pickupAdress, dropoffAddress, deliveryId, distance, setSelectedTab}: DeliverModalProps) {

    const router = useRouter();
    const [operatorId, setOperatorId] = useState("");
    const [hubId, setHubId] = useState("");
    const [driverName, setDriverName] = useState("");

    useEffect(() => {

        const fetchData = async () => {
            
            try{

                const firebaseUser = auth.currentUser;

                if (!firebaseUser) return;

                const driverRef = doc(db, "drivers", firebaseUser.uid);
                const driverDoc = await getDoc(driverRef);

                if (!driverDoc.exists()) return;

                const operatorId = driverDoc.data().operatorId;
                const hubId = driverDoc.data().hubId;
                const driverName = driverDoc.data().driverName;

                setOperatorId(operatorId);
                setHubId(hubId);
                setDriverName(driverName);

            }catch(error){
                console.error(error);
            } 
        }

        fetchData();

    }, [])

    const startDelivery = async () => {
        console.log("Delivery on loading...");

        if (!pickupAdress || !dropoffAddress || !deliveryId || !distance) {
            alert("Missing field.");
            return;
        }

        if (!operatorId || !hubId) {
            alert("Driver information is still loading.");
            return;
        }

        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) return;

            const driverRef = doc(db, "drivers", firebaseUser.uid);
            const driverSnap = await getDoc(driverRef);

            if (!driverSnap.exists()) return;

            const deliveryData = {
                deliveryId,
                pickupAdress,
                dropoffAddress,
                distance,
                time: serverTimestamp(),
                driverId: firebaseUser.uid,
                driverName: driverName,
            };

            await setDoc(
                doc(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "inTransit",
                    deliveryId
                ),
                { deliveryData }
            );

            console.log("Added to in-transit successfully.");
            setSelectedTab("dashboard");

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={{flex: 1, padding: 24, backgroundColor: "rgba(69, 90, 100, 0.95)", alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>

            <View style={{flex: 1, width: "100%"}}>

                <Pressable style={{}}
                    onPress={() => setIsProceed((prev) => !prev)}>
                    <MaterialIcons
                        name="chevron-left"
                        size={32}
                        color= "#E5E7DF"
                    />
                </Pressable>

            </View>

            <View style={{flex: 1, width: "100%", alignItems: 'flex-start', justifyContent: 'flex-start', paddingBlock: 12}}>
                    
                <View style={{flexDirection: "row", width: "100%", alignItems: 'center', justifyContent: 'space-between', paddingBlock: 12}}>

                    <View style={{gap: 12}}>
                        <Text style={{color: "gray", fontSize: 16}}>DeliveryId</Text>
                        <Text style={{color: "#E5E7DF", fontSize: 18}}>{deliveryId}</Text>
                    </View>
                    <View style={{gap: 12}}>
                        <Text style={{color: "gray", fontSize: 16}}>Distance</Text>
                        <Text style={{color: "#E5E7DF", fontSize: 18}}>{distance ? `${(distance / 1000).toFixed(2)} km` : "--"}</Text>
                    </View>
                    
                </View>
                
                <View style={{paddingBlock: 12, width: "100%", borderTopWidth: 1, borderColor: "gray", gap: 12}}>

                    <Text style={{color: "gray", fontSize: 16}}>From</Text>
                    <Text style={{color: "#E5E7DF", fontSize: 18}}>{pickupAdress}</Text>

                    <Text style={{color: "gray", fontSize: 16}}>To</Text>
                    <Text style={{color: "#E5E7DF", fontSize: 18}}>{dropoffAddress}</Text>

                </View>

                <View style={{flexDirection: 'row', width: "100%", alignItems: 'center', justifyContent: 'space-between', paddingBlock: 12, borderTopWidth: 1, borderColor: "gray", gap: 12}}>

                    <View style={{gap: 12}}>
                        <Text style={{color: "gray", fontSize: 16}}>Date</Text>
                        <Text style={{color: "#E5E7DF", fontSize: 18}}>{new Date().toLocaleDateString()}</Text>
                    </View>

                </View>

                <View style={{width: "100%", padding: 12, borderRadius: 12, backgroundColor: "#EA7B7B", marginTop: 12, marginBottom: 6}}>

                    <Pressable 
                        onPress={startDelivery}>
                        <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Start</Text>
                    </Pressable>

                </View>

            </View>

        </View>
    )
}