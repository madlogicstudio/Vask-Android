import { auth, db } from '@/firebase/FireabseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from 'expo-router';
import { useVideoPlayer } from "expo-video";
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword, } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, Text, TextInput, View } from 'react-native';
import AddVehicle from './AddVehicle';

type Vehicle = {
    contactNumber: string;
    createdAt: string;
    driverId: string;
    driverName: string;
    operatorId: string;
    plateNumber: string;
    vehicleName: string;
    vehicleType: string;
};

export default function ProfileTab() {

    const router = useRouter();
    const player = useVideoPlayer(require("../assets/Catronaut.mp4"), player => {
        player.loop = true;
        player.play();
    });
    const [points, setPoints] = useState("0");
    const [operatorId, setOperatorId] = useState("");
    const [hubId, setHubId] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [showRegister, setShowRegister] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
    const [driverImage, setDriverImage] = useState("");
    const [driverBgImage, setDriverBgImage] = useState("");

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

                setOperatorId(operatorId);
                setHubId(hubId);

                // Find the driver's vehicle
                const driversRef = collection(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "drivers"
                );

                const q = query(
                    driversRef,
                    where("driverId", "==", firebaseUser.uid)
                );

                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const vehicleDoc = snapshot.docs[0];

                    setVehicleId(vehicleDoc.id);
                    setVehicleData(vehicleDoc.data() as Vehicle);

                    setIsRegistered(true);

                    console.log("Vehicle ID:", vehicleDoc.id);
                    console.log("Vehicle Data:", vehicleDoc.data());
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();

    }, []);

    //profileimg
    const pickProfilePicture = async () => {
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

            await updateDoc(
                doc(db, "drivers", auth.currentUser!.uid),
                {
                    driverImage: data.secure_url,
                }
            );

            setDriverImage(data.secure_url);

        } catch (error) {
            console.error(error);
        }
    };

    //fetchprofimg
    const fetchProfileImg = async () => {
        const firebaseUser = auth.currentUser;

        if(!firebaseUser) return

        const driverRef = doc(
            db,
            "drivers",
            firebaseUser?.uid
        );

        const driverDoc = await getDoc(driverRef);

        if (driverDoc.exists()) {
            setDriverImage(
                driverDoc.data().driverImage || ""
            );
        }
    }

    useEffect(() => {

        fetchProfileImg();

    }, []);

    //BgImg
    const pickBackgroundPicture = async () => {
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

            await updateDoc(
                doc(db, "drivers", auth.currentUser!.uid),
                {
                    driverBackgroundImage: data.secure_url,
                }
            );

            setDriverBgImage(data.secure_url);

        } catch (error) {
            console.error(error);
        }
    };

    //fetchbgimg
    const fetchBgImg = async () => {
        const firebaseUser = auth.currentUser;

        if(!firebaseUser) return

        const driverRef = doc(
            db,
            "drivers",
            firebaseUser?.uid
        );

        const driverDoc = await getDoc(driverRef);

        if (driverDoc.exists()) {
            setDriverBgImage(
                driverDoc.data().driverBackgroundImage || ""
            );
        }
    }

    useEffect(() => {

        fetchBgImg();

    }, []);

    //signout
    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            router.replace("/account");
                        } catch (error) {
                            console.log("Sign out error:", error);
                        }
                    },
                },
            ]
        );
    };

    //changepassword
    const handleChangePassword = async (
        currentPassword: string,
        newPassword: string
    ) => {
        try {
            const user = auth.currentUser;

            if (!user || !user.email) {
                alert("No authenticated user found.");
                return;
            }

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await reauthenticateWithCredential(
                user,
                credential
            );

            // Update password
            await updatePassword(
                user,
                newPassword
            );

            alert("Password updated successfully!");

        } catch (error: any) {
            console.log(error.code);

            switch (error.code) {
                case "auth/wrong-password":
                case "auth/invalid-credential":
                    alert("Current password is incorrect.");
                    break;

                case "auth/weak-password":
                    alert("New password must be at least 6 characters.");
                    break;

                case "auth/network-request-failed":
                    alert("No internet connection.");
                    break;

                case "auth/requires-recent-login":
                    alert("Please sign in again before changing your password.");
                    break;

                default:
                    alert("Failed to update password.");
                    console.log(error);
            }
        }
    };

    if(showRegister) return (
        <View style={{flex: 1, width: "100%"}}>
            
            <AddVehicle setShowRegister={setShowRegister} />

        </View>
    );
    
    if(!showRegister) return (
        <View style={{flex: 1, width: "100%"}}>

            {/* updatePassModal */}
            <Modal
                visible={showPasswordModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 24,
                    }}
                >
                    <View
                        style={{
                            width: "100%",
                            backgroundColor: "#E5E7DF",
                            borderRadius: 20,
                            padding: 24,
                            gap: 16,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: "#455A64",
                                textAlign: "center",
                            }}
                        >
                            Change Password
                        </Text>

                        <TextInput
                            placeholder="Current Password"
                            placeholderTextColor="#455A64"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            style={{
                                borderWidth: 1,
                                borderColor: "#455A64",
                                borderRadius: 24,
                                padding: 12,
                                fontSize: 16
                            }}
                        />

                        <TextInput
                            placeholder="New Password"
                            placeholderTextColor="#455A64"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={{
                                borderWidth: 1,
                                borderColor: "#455A64",
                                borderRadius: 24,
                                padding: 12,
                                fontSize: 16
                            }}
                        />

                        <TextInput
                            placeholder="Confirm New Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            style={{
                                borderWidth: 1,
                                borderColor: "#455A64",
                                borderRadius: 24,
                                padding: 12,
                                fontSize: 16
                            }}
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                gap: 12,
                            }}
                        >
                            <Pressable
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    borderRadius: 24,
                                    backgroundColor: "#D6D6D6",
                                }}
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                            >
                                <Text style={{ textAlign: "center", fontSize: 16 }}>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    borderRadius: 24,
                                    backgroundColor: "#455A64",
                                }}
                                onPress={async () => {
                                    if (newPassword !== confirmPassword) {
                                        alert("Passwords do not match.");
                                        return;
                                    }

                                    await handleChangePassword(
                                        currentPassword,
                                        newPassword
                                    );

                                    setShowPasswordModal(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#E5E7DF",
                                        textAlign: "center",
                                        fontSize: 16
                                    }}
                                >
                                    Update
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={{flex: 1, width: "100%", alignItems: 'center', justifyContent: 'center' }}>
                {/* BgImg */}
                <View style={{flex: 1, width: "100%"}}>

                    <View style={{flex: 1, width: "100%"}}>
                        {driverBgImage ? (
                                <Image
                                    source={{ uri: driverBgImage }}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            ) : (
                                <View
                                    style={{
                                        flex: 1,
                                        width: "100%"
                                    }}
                                >  
                                </View>
                            )}
                    </View>

                    <Pressable style={{position: 'absolute', right: 0, bottom: 0, borderRadius: 100, backgroundColor: "#455A64", 
                        padding: 6, margin: 12}}
                        onPress={pickBackgroundPicture}>
                        <MaterialIcons
                            name="edit"
                            size={18}
                            color= "#E5E7DF"
                        />
                    </Pressable>

                </View>

                <View style={{flex: 1, width: "100%", alignItems: 'center', justifyContent: 'center', gap: 12, position: 'absolute'}}>
                    {/* ProfileImg */}
                    <View style={{ position: "relative" }}>
                        <View
                            style={{
                                height: 120,
                                width: 120,
                                borderRadius: 60,
                                overflow: "hidden",
                                backgroundColor: "#E5E7DF",
                            }}
                        >
                            {driverImage ? (
                                <Image
                                    source={{ uri: driverImage }}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            ) : (
                                <View
                                    style={{
                                        flex: 1,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <MaterialIcons
                                        name="person"
                                        size={60}
                                        color="#455A64"
                                    />
                                </View>
                            )}
                        </View>

                        <Pressable
                            style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                backgroundColor: "#455A64",
                                borderRadius: 100,
                                padding: 6,
                            }}
                            onPress={pickProfilePicture}
                        >
                            <MaterialIcons
                                name="edit"
                                size={18}
                                color="#E5E7DF"
                            />
                        </Pressable>
                    </View>
                    {/* Points */}
                    <Pressable style={{flexDirection: 'row', gap: 12, backgroundColor: "#E5E7DF", padding: 12, borderRadius: 24}}
                        onPress={() => router.replace("/dashboard")}>
                        <MaterialIcons
                            name="celebration"
                            size={22}
                            color= "#EA7B7B"
                        />
                        <Text style={{fontSize: 16, color: "#455A64"}}>
                            {points} Points
                        </Text>
                    </Pressable>
                </View>
                
            </View>

            <View style={{flex: 1, width: "100%", alignItems: 'center', justifyContent: 'flex-start', padding: 24}}>
                
                {/* vehicle */}
                {!isRegistered && <Pressable style={{width: "100%", flexDirection: "row", alignItems: 'center', justifyContent: 'center', 
                    borderBottomWidth: 1, borderColor: "grey", padding: 12, paddingBottom: 24, gap: 12}}
                    onPress={() => setShowRegister((prev) => !prev)}>
                    
                    <View style={{backgroundColor: "#D6D6D6", padding: 6, borderRadius: 100}}>
                        <MaterialIcons
                            name="app-registration"
                            size={24}
                            color= "#455A64"
                        />
                    </View>
    
                    <Text style={{fontSize: 16, color: "#455A64", fontWeight: 'bold'}}>Register Vehicle</Text>

                    <View style={{borderRadius: 100, marginLeft: 'auto'}}>
                        <MaterialIcons
                            name="chevron-right"
                            size={32}
                            color= "#455A64"
                        />
                    </View>

                </Pressable>}

                {isRegistered && <View style={{width: "100%", alignItems: 'flex-start', justifyContent: 'center', 
                    borderBottomWidth: 1, borderColor: "grey", padding: 12, paddingBottom: 24, gap: 12}}>
                    
                    <Text style={{fontSize: 16, color: "#455A64", fontWeight: 'bold'}}>Registered Vehicle: </Text>

                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Vehicle Id: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>{vehicleId}</Text>
                    </View>
                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Driver Name: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>{vehicleData?.driverName}</Text>
                    </View>
                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Operator Id: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>{vehicleData?.operatorId}</Text>
                    </View>
                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Date Started: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>
                            {vehicleData? new Date(vehicleData.createdAt).toLocaleString(): ""}</Text>
                    </View>
    
                </View>}

                <Pressable style={{width: "100%", flexDirection: "row", alignItems: 'center', justifyContent: 'center', 
                    borderBottomWidth: 1, borderColor: "grey", paddingInline: 12, paddingBlock: 24, gap: 12}}
                    onPress={() => setShowPasswordModal(true)}>

                    <View style={{backgroundColor: "#D6D6D6", padding: 6, borderRadius: 100}}>
                        <MaterialIcons
                            name="lock-reset"
                            size={24}
                            color= "#455A64"
                        />
                    </View>
    
                    <Text style={{fontSize: 16, color: "#455A64", fontWeight: 'bold'}}>Change Password</Text>

                    <View style={{borderRadius: 100, marginLeft: 'auto'}}>
                        <MaterialIcons
                            name="chevron-right"
                            size={32}
                            color= "#455A64"
                        />
                    </View>
                </Pressable>

                <Pressable style={{width: "100%", flexDirection: "row", alignItems: 'center', justifyContent: 'center', 
                    padding: 12, gap: 12, marginTop: 'auto', backgroundColor: "#455A64", borderRadius: 100}}
                    onPress={handleSignOut}>

                    <View style={{}}>
                        <MaterialIcons
                            name="logout"
                            size={24}
                            color= "#D6D6D6"
                        />
                    </View>
    
                    <Text style={{fontSize: 16, color: "#D6D6D6", fontWeight: 'bold'}}>Sign Out</Text>

                </Pressable>

            </View>

        </View>
    )
}