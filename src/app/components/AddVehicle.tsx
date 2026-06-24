import {
    Poppins_400Regular,
    Poppins_700Bold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { SetStateAction, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from "../../firebase/FireabseConfig";

type AddVehicleProps = {
    setShowRegister: React.Dispatch<SetStateAction<boolean>>
}

export default function AddVehicle({setShowRegister}: AddVehicleProps) {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const player = useVideoPlayer(require("../assets/Catronaut.mp4"), player => {
        player.loop = true;
        player.play();
    });
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_700Bold,
    });

    const [operatorId, setOperatorId] = useState("");
    const [hubId, setHubId] = useState("");

    const [driverName, setDriverName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [vehicleName, setVehicleName] = useState('');
    const [vehicleType, setVehicleType] = useState('');

    // useEffect(() => {

    //     setLoading(true);

    //     setTimeout(() => {
    //         setLoading(false);
    //     }, 2000)
    // }, []);

    useEffect(() => {

        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            console.log("No firebase user");
            return;
        }

        const fetchOperatorId = async () => {

            const driverRef = doc(db, "drivers", firebaseUser.uid);

            console.log("Fetching...");

            const driverDoc = await getDoc(driverRef);

            console.log("Driver exists:", driverDoc.exists());

            if (driverDoc.exists()) {
                console.log("Driver data:", driverDoc.data());

                setOperatorId(driverDoc.data().operatorId);
                setHubId(driverDoc.data().hubId);
            }
        };

        fetchOperatorId();

    }, [])

    const registerVehicle = async () => {
        try {
            setLoading(true);
            if (!driverName || !plateNumber || !vehicleName || !vehicleType) {
                alert("Please fill in all fields.");
                return;
            }

            const user = auth.currentUser;

            if (!user) {
                alert("You must be logged in.");
                return;
            }

            // Get driver's information
            const driverRef = doc(db, "drivers", user.uid);
            const driverSnap = await getDoc(driverRef);

            if (!driverSnap.exists()) {
                alert("Driver profile not found.");
                return;
            }

            const driverData = driverSnap.data();
            const operatorId = driverData.operatorId;

            await addDoc(collection(db, "operators", operatorId, "hubs", hubId, "drivers"), {
                operatorId,
                driverId: user.uid,
                driverName,
                contactNumber,
                plateNumber,
                vehicleName,
                vehicleType,
                createdAt: Date.now(),
            });

            await updateDoc(driverRef, {
                driverName: driverName,
            });
            
            setLoading(false);
            alert("Vehicle registered successfully!");
            setShowRegister((prev) => !prev);

        } catch (err) {
            console.error(err);
            alert("Failed to register vehicle.");
        }
    };

    if (loading) {
        return (
          <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, backgroundColor: "white" }}>
            <VideoView
              player={player}
              nativeControls={false}
              pointerEvents="none"
              style={{ width: 420, height: 420 }}
            />
            <ActivityIndicator size="large" color="#455A64" style={{ transform: [{ scale: 2 }] }} />
          </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, width: "100%", justifyContent: "flex-start"}}>

            <Pressable style={{width: "100%", paddingInline: 16}}
                onPress={() => setShowRegister((prev) => !prev)}>        
                <MaterialIcons
                    name="chevron-left"
                    size={32}
                    color= "#455A64"
                />
            </Pressable>

            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingInline: 24}}>

                <Text style={{ fontSize: 24, marginBlock: 32}}>Register your vehicle</Text>
                {/* <Image 
                    source={require('../assets/Delivery.png')} 
                    style={{height: 360, width: 360}} 
                /> */}
                <TextInput value={driverName} onChangeText={setDriverName} placeholder="Driver Name" placeholderTextColor="#455A64"
                    style={{width: "100%", borderWidth: 2, borderColor: "#455A64", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
                <TextInput value={contactNumber} onChangeText={setContactNumber} placeholder="Contact Number" placeholderTextColor="#455A64"
                    style={{width: "100%", borderWidth: 2, borderColor: "#455A64", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
                <TextInput value={plateNumber} onChangeText={setPlateNumber} placeholder="Plate Number" placeholderTextColor="#455A64"
                    style={{width: "100%", borderWidth: 2, borderColor: "#455A64", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
                <TextInput value={vehicleName} onChangeText={setVehicleName} placeholder="Vehicle Name" placeholderTextColor="#455A64"
                    style={{width: "100%", borderWidth: 2, borderColor: "#455A64", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
                
                <View
                    style={{
                        width: '100%',
                        borderWidth: 2,
                        borderColor: '#455A64',
                        borderRadius: 32,
                        overflow: 'hidden',
                        paddingBlock: 2,
                        paddingInline: 12
                    }}
                >
                    <Picker
                        selectedValue={vehicleType}
                        onValueChange={(itemValue) => setVehicleType(itemValue)}
                    >
                        <Picker.Item label="Select Vehicle Type" value="" />
                        <Picker.Item label="Motorcycle" value="motorcycle" />
                        <Picker.Item label="Car" value="car" />
                        <Picker.Item label="Van" value="van" />
                        <Picker.Item label="Truck" value="truck" />
                    </Picker>
                </View>

                <Pressable
                    onPress={registerVehicle}
                    style={{
                        width: "100%",
                        padding: 12,
                        borderRadius: 32,
                        backgroundColor: "#455A64",
                        marginTop: "auto"
                    }}
                >
                    <Text
                    style={{
                        fontSize: 16,
                        color: "#ededed",
                        fontFamily: "Poppins_400Regular",
                        textAlign: "center",
                    }}
                    >
                    Register Vehicle
                    </Text>
                </Pressable>

            </View>

        </SafeAreaView>
    )
}