import { auth, db } from '@/firebase/FireabseConfig';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

type AddReportProps = {
    setPicker: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
    refreshReports: () => Promise<void>;
}

export default function AddReport({setPicker, setSelectedTab, refreshReports,}: AddReportProps) {

    const [isVisible, setIsVisible] = useState(true);
    const [operatorId, setOperatorId] = useState("");
    const [hubId, setHubId] = useState("");
    const [maintenanceForm, setMaintenanceForm] = useState(false);
    const [fuelForm, setFuelForm] = useState(false);
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("");
    const [liters, setLiters] = useState("");
    const [amount, setAmount] = useState("");
    const [maintenanceImg, setMaintenanceImg] = useState("");
    const [fuelImg, setFuelImg] = useState("");
    const [driverName, setDriverName] = useState("");

    //fetchData
    useEffect(() => {
        const fetchData = async () => {
            const firebaseUser = auth.currentUser;

            if (!firebaseUser) return;

            try {
                // Get driver document
                const driverRef = doc(db, "drivers", firebaseUser.uid);
                const driverDoc = await getDoc(driverRef);

                if (!driverDoc.exists()) return;

                const operatorId = driverDoc.data().operatorId;
                const hubId = driverDoc.data().hubId;
                const name = driverDoc.data().driverName;

                setOperatorId(operatorId);
                setHubId(hubId);
                setDriverName(name)
                
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();

    }, []);

    //save maintenancePic
    const pickMaintenancePicture = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                alert("Permission denied");
                return;
            }

            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            if (result.canceled) return;

            const asset = result.assets[0];

            const file = new File(asset.uri);
            const base64 = await file.base64();

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

            console.log(data);

            setMaintenanceImg(data.secure_url);

        } catch (error) {
            console.error(error);
        }
    };

    //save fuelPic
    const pickFuelPicture = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                alert("Permission denied");
                return;
            }

            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            if (result.canceled) return;

            const asset = result.assets[0];

            const file = new File(asset.uri);
            const base64 = await file.base64();

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

            console.log(data);

            setFuelImg(data.secure_url);

        } catch (error) {
            console.error(error);
        }
    };

    //saveMaintenance
    const saveMaintenance = async () => {

        const firebaseUser = auth.currentUser;

        if(!firebaseUser) return

        await addDoc(
            collection(
                db,
                "operators",
                operatorId,
                "hubs",
                hubId,
                "maintenance"
            ),
            {
                description,
                cost,
                maintenanceImg,
                pending: "pending",
                driverName: driverName,
                driverId: firebaseUser.uid
            }
        );
        
        setPicker(false);
        await refreshReports();
        console.log("Maintenance saved.");
    }

    //saveFuelLog
    const saveFuelLog = async () => {

        const firebaseUser = auth.currentUser;

        if(!firebaseUser) return

        await addDoc(
            collection(
                db,
                "operators",
                operatorId,
                "hubs",
                hubId,
                "fuelLog"
            ),
            {
                liters: liters,
                amount: amount,
                fuelLogImg: fuelImg,
                pending: "pending",
                driverName: driverName,
                driverId: firebaseUser.uid
            }
        );
        
        setPicker(false);
        await refreshReports();
        console.log("Fuel log saved.");
    }

    return (
        <View style={{width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", position: 'absolute',
            alignItems: 'center', justifyContent: 'center', zIndex: 2, padding: 12
        }}>
            <View style={{backgroundColor: "#455A64", padding: 24, gap: 12, borderRadius: 12, borderTopRightRadius: 0}}>

                <Pressable style={{position: 'absolute', top: -10, right: -10}} 
                    onPress={() => setPicker((prev) => !prev)}>
                    <MaterialCommunityIcons
                        name="close-circle"
                        size={32}
                        color= "#E5E7DF"
                    />
                </Pressable>

                {isVisible && <Text style={{fontSize: 16, paddingBlock: 12, color: "#E5E7DF", textAlign: "center"}}>What do you want to perform?</Text>}

                {isVisible && <Pressable style={{backgroundColor: "#4D849D", padding: 12, borderRadius: 24}}
                    onPress={() => {
                        setMaintenanceForm(true);
                        setIsVisible(false);
                    }}>
                    <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Maintenance</Text>
                </Pressable>}

                {isVisible && <Pressable style={{backgroundColor: "#4D849D", padding: 12, borderRadius: 24}}
                    onPress={() => {
                            setFuelForm(true);
                            setIsVisible(false);
                        }}>
                    <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Fuel</Text>
                </Pressable>}
                
                {/* Maintenance */}
                {maintenanceForm && <View style={{padding: 12, gap: 12}}>

                    <Text style={{fontSize: 20, color: "#E5E7DF", fontWeight: "bold", width: 260,
                        borderBottomWidth: 1, borderColor: "gray", paddingBottom: 12
                    }}>Add Maintenance</Text>

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Description"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        maxLength={200}
                        placeholderTextColor="#455A64"
                        style={{
                            width: "100%",
                            backgroundColor: "#E5E7DF",
                            padding: 12,
                            fontSize: 16,
                            borderRadius: 12,
                            flexWrap: 'wrap',
                            maxWidth: 300,
                            color: "#455A64"
                    }} />

                    <TextInput
                        value={cost}
                        onChangeText={setCost}
                        placeholder="Cost"
                        placeholderTextColor="#455A64"
                        maxLength={8}
                        style={{
                            width: "100%",
                            backgroundColor: "#E5E7DF",
                            padding: 12,
                            borderRadius: 12,
                            fontSize: 16,
                            color: "#455A64"
                    }} />

                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: 'center', paddingBlock: 6, 
                        borderWidth: 1, borderColor: "gray", borderRadius: 12, gap: 12}}>
                        
                        <Pressable
                            onPress={pickMaintenancePicture}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 6,
                                borderRadius: 12,
                                gap: 12,
                            }}
                        >
                            {maintenanceImg ? (
                                <Image
                                    source={{ uri: maintenanceImg }}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 12,
                                    }}
                                />
                            ) : (
                                <>
                                    <MaterialIcons
                                        name="camera-alt"
                                        size={32}
                                        color="#EA7B7B"
                                    />

                                    <View>
                                        <Text
                                            style={{
                                                color: "#EA7B7B",
                                                fontSize: 18,
                                            }}
                                        >
                                            Upload Receipt
                                        </Text>

                                        <Text
                                            style={{
                                                color: "#E5E7DF",
                                                fontSize: 16,
                                            }}
                                        >
                                            Attach receipt photo
                                        </Text>
                                    </View>
                                </>
                            )}
                        </Pressable>
                    </View>

                    <Pressable style={{backgroundColor: "#4D849D", padding: 12, borderRadius: 24}}
                        onPress={saveMaintenance}>
                        <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Save Maintenance</Text>
                    </Pressable>
                        
                    
                </View>}

                {/* Fuel */}
                {fuelForm && <View style={{padding: 12, gap: 12}}>

                    <Text style={{fontSize: 20, color: "#E5E7DF", fontWeight: "bold", width: 260,
                        borderBottomWidth: 1, borderColor: "gray", paddingBottom: 12
                    }}>Add Fuel</Text>

                    <TextInput
                        value={liters}
                        onChangeText={setLiters}
                        placeholder="Liters"
                        placeholderTextColor="#455A64"
                        maxLength={8}
                        style={{
                            width: "100%",
                            backgroundColor: "#E5E7DF",
                            padding: 12,
                            fontSize: 16,
                            borderRadius: 12,
                            flexWrap: 'wrap',
                            maxWidth: 300,
                            color: "#455A64"
                    }} />

                    <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="Amount Per Liter"
                        placeholderTextColor="#455A64"
                        maxLength={8}
                        style={{
                            width: "100%",
                            backgroundColor: "#E5E7DF",
                            padding: 12,
                            borderRadius: 12,
                            fontSize: 16,
                            color: "#455A64"
                    }} />

                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: 'center', paddingBlock: 6, 
                        borderWidth: 1, borderColor: "gray", borderRadius: 12, gap: 12}}>
                        
                        <Pressable
                            onPress={pickFuelPicture}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 6,
                                borderRadius: 12,
                                gap: 12,
                            }}
                        >
                            {fuelImg ? (
                                <Image
                                    source={{ uri: fuelImg }}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 12,
                                    }}
                                />
                            ) : (
                                <>
                                    <MaterialIcons
                                        name="camera-alt"
                                        size={32}
                                        color="#EA7B7B"
                                    />

                                    <View>
                                        <Text
                                            style={{
                                                color: "#EA7B7B",
                                                fontSize: 18,
                                            }}
                                        >
                                            Upload Receipt
                                        </Text>

                                        <Text
                                            style={{
                                                color: "#E5E7DF",
                                                fontSize: 16,
                                            }}
                                        >
                                            Attach receipt photo
                                        </Text>
                                    </View>
                                </>
                            )}
                        </Pressable>
                    </View>

                    <Pressable style={{backgroundColor: "#4D849D", padding: 12, borderRadius: 24}}
                        onPress={saveFuelLog}>
                        <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Save Fuel</Text>
                    </Pressable>
                        
                    
                </View>}

            </View> 
            

        </View>
    )
}