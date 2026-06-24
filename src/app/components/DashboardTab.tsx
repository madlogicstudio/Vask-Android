import { auth, db } from '@/firebase/FireabseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from "expo-notifications";
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import CurrentCard from './CurrentCard';
import FinishedCard from './FinishedCard';
import ReportCard from './ReportCard';

type InTransitData = {
    cost: number;
    deliveryId: string;
    distance: number;
    dropoffAddress: string;
    pickupAdress: string;
    driverId: string;
    driverName: string;
    completedAt?: number;
};

type VehicleType = "car" | "truck" | "motorcycle" | "van";

type Vehicle = {
    contactNumber: string;
    createdAt: string;
    driverId: string;
    driverName: string;
    operatorId: string;
    plateNumber: string;
    vehicleName: string;
    vehicleType: VehicleType;
};

type DashboardTabProps = {
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
};

type ReportData = {
    id: string;
    type: "maintenance" | "fuel";
    title?: string;
    amount: string;
    liters?: string;
    image: string;
    createdAt: number;
    status: string;
    read: boolean;
    driverId: any;
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function DashboardTab({setSelectedTab}: DashboardTabProps) {

    const router = useRouter();
    const [operatorId, setOperatorId] = useState("");
    const [hubId, setHubId] = useState("");
    const [inTransitIds, setInTransitIds] = useState<string[]>([]);
    const [inTransitData, setInTransitData] = useState<InTransitData[]>([]);
    const [driverImage, setDriverImage] = useState("");
    const [points, setPoints] = useState("0");
    const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
    const [vehicleId, setVehicleId] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [completedData, setCompletedData] = useState<InTransitData[]>([]);
    const [driverId ,setDriverId] = useState("");
    const [driverName ,setDriverName] = useState("")

    const [reports, setReports] = useState<ReportData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    //forId
    useEffect(() => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;

        console.log("Fetching driverData...");

        const fetchDriverData = async () => {
            try {
                const driverRef = doc(db, "drivers", firebaseUser.uid);
                const driverDoc = await getDoc(driverRef);

                if (!driverDoc.exists()) return;

                setOperatorId(driverDoc.data().operatorId);
                setHubId(driverDoc.data().hubId);
                setDriverId(driverDoc.data().uid);
                setDriverId(firebaseUser.uid);

            } catch (error) {
                console.error(error);
            }
        };

        fetchDriverData();
    }, []);

    //getDriverVehicleInfo
    const getVehicleInfo = async () => {

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;

        // Find the driver's vehicle
        const vehiclesRef = collection(
            db,
            "operators",
            operatorId,
            "hubs",
            hubId,
            "drivers"
        );

        const q = query(
            vehiclesRef,
            where("driverId", "==", firebaseUser.uid)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const vehicleDoc = snapshot.docs[0];

            setVehicleId(vehicleDoc.id);
            const data = vehicleDoc.data() as Vehicle;
            setVehicleData(data);
            
            console.log("Vehicle ID:", vehicleDoc.id);
            console.log("Vehicle Data:", vehicleDoc.data());
        }

        if(snapshot.empty) {
            console.log("Can't find driver's vehicle info...")
        }
    }

    useEffect(() => {

        getVehicleInfo();
        
    }, [operatorId])

    //fetchIntransitData
    useEffect(() => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser || !operatorId || !hubId || !driverId) return;

        const fetchInTransit = async () => {
            try {
                const colRef = collection(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "inTransit"
                );

                const q = query(
                    colRef,
                    where("deliveryData.driverId", "==", driverId)
                );

                const snapshot = await getDocs(q);

                const data = snapshot.docs.map(doc =>
                    doc.data().deliveryData as InTransitData
                );

                setInTransitData(data);

            } catch (error) {
                console.error(error);
            }
        };

        fetchInTransit();
    }, [operatorId, hubId, driverId]);

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

    //completeDeliver
    const handleComplete = async (delivery: InTransitData) => {
        try {
            // Add to completed
            await setDoc(
                doc(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "completed",
                    delivery.deliveryId
                ),
                {
                    ...delivery,
                    driverId: driverId,
                    driverName: driverName,
                    completedAt: serverTimestamp()
                }
            );

            // Remove from inTransit
            await deleteDoc(
                doc(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "inTransit",
                    delivery.deliveryId
                )
            );

            // Update UI
            setInTransitData((prev) =>
                prev.filter(
                    (item) => item.deliveryId !== delivery.deliveryId
                )
            );

        } catch (error) {
            console.error(error);
        }
    };

    // get finished deliveries
    useEffect(() => {
        if (!operatorId || !hubId || !driverId) return;

        const fetchCompleted = async () => {
            try {
                const completedQuery = query(
                    collection(
                        db,
                        "operators",
                        operatorId,
                        "hubs",
                        hubId,
                        "completed"
                    ),
                    where("driverId", "==", driverId)
                );

                const snapshot = await getDocs(completedQuery);

                const completed = snapshot.docs.map(doc => {
                    const data = doc.data();

                    return {
                        deliveryId: data.deliveryId,
                        distance: data.distance,
                        pickupAdress: data.pickupAdress,
                        dropoffAddress: data.dropoffAddress,
                        cost: data.cost,
                        driverId: data.driverId,
                        driverName: data.driverName,
                        completedAt: data.completedAt?.toMillis() ?? 0,
                    } as InTransitData;
                })

                .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

                setCompletedData(completed);

                console.log("Completed deliveries:", completed);

            } catch (error) {
                console.error(error);
            }
        };

        fetchCompleted();

    }, [operatorId, hubId, driverId]);

    // fetchReports
    useEffect(() => {
        if (!operatorId || !hubId || !driverId) return;

        const q = query(
            collection(
                db,
                "operators",
                operatorId,
                "hubs",
                hubId,
                "reports"
            ),
            where("driverId", "==", driverId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {

            snapshot.docChanges().forEach(async (change) => {
                if (
                    change.type === "modified" &&
                    change.doc.data().read === false
                ) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Report Update",
                            body:
                                change.doc.data().status === "approved"
                                    ? "Your report was approved"
                                    : "Your report was rejected",
                        },
                        trigger: null,
                    });
                }
            });

            const data: ReportData[] = snapshot.docs.map((reportDoc) => {
                const report = reportDoc.data();

                console.log(
                    "amount:", report.amount,
                    "liters:", report.liters,
                    "amount type:", typeof report.amount,
                    "liters type:", typeof report.liters
                );

                return {
                    id: reportDoc.id,
                    type: report.type,
                    title: report.title,
                    amount: report.amount,
                    liters: report.liters,
                    image: report.image,
                    createdAt: report.approvedAt?.toMillis?.() || 0,
                    status: report.status,
                    read: report.read ?? false,
                    driverId: report.driverId,
                };
            });

            data.sort((a, b) => b.createdAt - a.createdAt);

            setReports(data);

            setUnreadCount(
                data.filter(report => !report.read).length
            );
        });


        return () => unsubscribe();

    }, [operatorId, hubId, driverId]);

    //onNotifClose
    const markAllNotificationsAsRead = async () => {
        try {
            const unreadReports = reports.filter(
                report => !report.read
            );

            await Promise.all(
                unreadReports.map(report =>
                    updateDoc(
                        doc(
                            db,
                            "operators",
                            operatorId,
                            "hubs",
                            hubId,
                            "reports",
                            report.id
                        ),
                        {
                            read: true
                        }
                    )
                )
            );
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };

    return (
        <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
            {/* Header */}
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12, padding: 12}}>
                {/* Imgae */}
                <View
                    style={{
                        height: 70,
                        width: 70,
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
                <View style={{flexDirection: "column", height: "100%", gap: 6, alignItems: 'flex-start', justifyContent: 'flex-start'}}>

                    {/* Points */}
                    <Pressable style={{flexDirection: 'row', gap: 12, backgroundColor: "#E5E7DF", paddingBlock: 6, paddingInline: 12, borderRadius: 24}}
                        onPress={() => setSelectedTab("profile")}>
                        <MaterialIcons
                            name="celebration"
                            size={22}
                            color= "#EA7B7B"
                        />
                        <Text style={{fontSize: 16, color: "#455A64"}}>
                            {points} Points
                        </Text>
                    </Pressable>

                    <Text style={{color: "#455A64", fontSize: 18, fontWeight: 'bold'}}>
                        {vehicleData?.driverName}
                    </Text>

                </View>
                
                <View style={{ flex: 1, width: "100%", alignItems: "flex-end" }}>
                    <Pressable
                        onPress={() => setShowNotifications(true)}
                        style={{
                            backgroundColor: "#E5E7DF",
                            padding: 6,
                            borderRadius: 100,
                            position: "relative",
                        }}
                    >
                        <MaterialIcons
                            name="notifications"
                            size={32}
                            color="#455A64"
                        />

                        {unreadCount > 0 && (
                            <View
                                style={{
                                    position: "absolute",
                                    top: -2,
                                    right: -2,
                                    backgroundColor: "#EA7B7B",
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: 10,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {unreadCount}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>


            </View>

            {/* Current */}
            <View style={{ flex: 1, width: "100%"}}>
                <View style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
                    <Text style={{ fontSize: 16, color: "#455A64" }}>
                        Current Delivery
                    </Text>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                >
                    {vehicleData &&
                        inTransitData.map((delivery) => (
                            <CurrentCard
                                key={delivery.deliveryId}
                                vehicleType={vehicleData.vehicleType}
                                deliveryId={delivery.deliveryId}
                                distance={delivery.distance}
                                from={delivery.pickupAdress}
                                to={delivery.dropoffAddress}
                                driverId={delivery.driverId}
                                driverName={delivery.driverName}
                                cost={delivery.cost}
                                onComplete={() => handleComplete(delivery)}
                            />
                        ))
                    }
                </ScrollView>
            </View>

            {/* Recent */}
            <View style={{ height: 200, width: "100%", marginBottom: 24 }}>
                <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
                    <Text style={{ fontSize: 16, color: "#455A64" }}>
                        Recent Activity
                    </Text>
                </View>

                <ScrollView
                    contentContainerStyle={{ padding: 12 }}
                >
                    {/* Completed Deliveries */}
                    {vehicleData &&
                        completedData.map((delivery) => (
                            <FinishedCard
                                key={delivery.deliveryId}
                                vehicleType={vehicleData.vehicleType}
                                deliveryId={delivery.deliveryId}
                                distance={delivery.distance}
                                from={delivery.pickupAdress}
                                to={delivery.dropoffAddress}
                                cost={delivery.cost}
                                driverId={delivery.driverId}
                                driverName={delivery.driverName}
                                date={delivery.completedAt}
                            />
                        ))}

                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            item={report}
                        />
                    ))}

                </ScrollView>
            </View>

            <Modal
                visible={showNotifications}
                transparent
                animationType="slide"
                onRequestClose={() => setShowNotifications(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: "90%",
                            maxHeight: "70%",
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                paddingBottom: 12,
                                borderBottomWidth: 1,
                                borderColor: "#ddd",
                            }}
                        >
                            Notifications
                        </Text>

                        <ScrollView>
                            {reports
                                .filter(report => !report.read)
                                .map(report => (
                                    <View
                                        key={report.id}
                                        style={{
                                            paddingVertical: 12,
                                            borderBottomWidth: 1,
                                            borderColor: "#ddd",
                                            gap: 12
                                        }}
                                    >   
                                        <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <Text style={{ fontSize: 16 }} numberOfLines={1}>
                                                {report.type === "maintenance"
                                                    ? report.title
                                                    : `Fuel Log - ₱${(
                                                        Number(report.amount || 0) *
                                                        Number(report.liters || 0)
                                                    ).toFixed(2)}`}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontWeight: "bold",
                                                    fontSize: 16,
                                                    color: report.status === "approved" ? "green" : "red"
                                                }}
                                            >
                                                {report.status === "approved"
                                                    ? "Report Approved"
                                                    : "Report Rejected"}
                                            </Text>

                                        </View>
                                        
                                        
                                        <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <Text style={{fontSize: 16}}>
                                                {report.type === "maintenance" ? "Maintenance" : "Fuel" }
                                            </Text>
                                            <Text style={{fontSize: 16}}>
                                                {new Date(report.createdAt).toLocaleString()}
                                            </Text>
                                        </View>
                                        
                                    </View>
                                ))
                            }

                            {reports.filter(report => !report.read).length === 0 && (
                                <Text style={{paddingTop: 12, fontSize: 16}}>No unread notifications.</Text>
                            )}
                        </ScrollView>

                        <Pressable
                            onPress={() => {
                                markAllNotificationsAsRead();
                                setShowNotifications(false)
                            }}
                            style={{
                                marginTop: 16,
                                backgroundColor: "#455A64",
                                padding: 12,
                                borderRadius: 8,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#fff",
                                    textAlign: "center",
                                    fontSize: 16
                                }}
                            >
                                Close
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

        </View>
    )
}