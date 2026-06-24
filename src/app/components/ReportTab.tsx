import { auth, db } from '@/firebase/FireabseConfig';
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import AddReport from './AddReport';
import FuelLogCard from "./FuelLogCard";
import MaintenanceCard from "./MaintenanceCard";

type ReportTabProps = {
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

type MaintenanceData = {
    id: string;
    description: string;
    cost: string;
    maintenanceImg: string;
    status: string;
};

type FuelLogData = {
    id: string;
    liters: string;
    amount: string;
    fuelLogImg: string;
    status: string;
};

export default function ReportTab({setSelectedTab}: ReportTabProps) {

    const [picker, setPicker] = useState(false);

    const [maintenanceData, setMaintenanceData] = useState<MaintenanceData[]>([]);
    const [fuelLogData, setFuelLogData] = useState<FuelLogData[]>([]);
    const [operatorId, setOperatorId] = useState("");
    const [hubId, setHubId] = useState("");

    useEffect(() => {
        const fetchDriverData = async () => {
            const firebaseUser = auth.currentUser;

            if (!firebaseUser) return;

            const driverDoc = await getDoc(
                doc(db, "drivers", firebaseUser.uid)
            );

            if (!driverDoc.exists()) return;

            setOperatorId(driverDoc.data().operatorId);
            setHubId(driverDoc.data().hubId);
        };

        fetchDriverData();
    }, []);

    //fetchmaintenance&fuel
    const fetchReports = async () => {
        if (!operatorId || !hubId) return;

        const firebaseUser = auth.currentUser;

        if (!firebaseUser) return;

        const maintenanceQuery = query(
            collection(
                db,
                "operators",
                operatorId,
                "hubs",
                hubId,
                "maintenance"
            ),
            where("driverId", "==", firebaseUser.uid)
        );

        const maintenanceSnapshot = await getDocs(maintenanceQuery);

        setMaintenanceData(
            maintenanceSnapshot.docs.map((doc) => ({
                id: doc.id,
                description: doc.data().description || "",
                cost: doc.data().cost || "",
                maintenanceImg: doc.data().maintenanceImg || "",
                status: doc.data().pending || "",
            }))
        );

        const fuelQuery = query(
            collection(
                db,
                "operators",
                operatorId,
                "hubs",
                hubId,
                "fuelLog"
            ),
            where("driverId", "==", firebaseUser.uid)
        );

        const fuelSnapshot = await getDocs(fuelQuery);

        setFuelLogData(
            fuelSnapshot.docs.map((doc) => ({
                id: doc.id,
                liters: doc.data().liters || "",
                amount: doc.data().amount || "",
                fuelLogImg: doc.data().fuelLogImg || "",
                status: doc.data().pending || ""
            }))
        );
    };

    useEffect(() => {
        fetchReports();
    }, [operatorId, hubId]);

    //deleteMaintenance
    const deleteMaintenance = async (id: string) => {
        try {
            await deleteDoc(
                doc(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "maintenance",
                    id
                )
            );

            setMaintenanceData((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch (error) {
            console.log("Error deleting maintenance report:", error);
        }
    };

    //deleteFuel
    const deleteFuelLog = async (id: string) => {
        try {
            await deleteDoc(
                doc(
                    db,
                    "operators",
                    operatorId,
                    "hubs",
                    hubId,
                    "fuelLog",
                    id
                )
            );

            setFuelLogData((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch (error) {
            console.log("Error deleting fuel log report:", error);
        }
    };

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>

            {picker && <AddReport setPicker={setPicker} setSelectedTab={setSelectedTab} refreshReports={fetchReports}/>}

            {/* Maintenance */}
            <ScrollView
                style={{
                    flex: 1,
                    width: "100%",
                    padding: 12,
                }}
            >
                <Text style={{ fontSize: 16, color: "#455A64", paddingBlock: 12 }}>
                    Maintenance Log
                </Text>

                {maintenanceData.map((item) => (
                    <MaintenanceCard
                        key={item.id}
                        item={item} 
                        onDelete={deleteMaintenance}
                        />
                ))}
            </ScrollView>

            {/* Fuel */}
            <ScrollView
                style={{
                    flex: 1,
                    width: "100%",
                    padding: 12,
                }}
            >
                <Text style={{ fontSize: 16, color: "#455A64" }}>
                    Fuel Log
                </Text>

                {fuelLogData.map((item) => (
                    <FuelLogCard
                        key={item.id}
                        item={item}
                        onDelete={deleteFuelLog}
                    />
                ))}
            </ScrollView>

            <View style={{width: "94%", padding: 12, borderRadius: 12, backgroundColor: "#455A64", marginTop: 12, marginBottom: 24}}>
            
                <Pressable onPress={() => setPicker((prev) => !prev)}>
                    <Text style={{fontSize: 16, color: "#E5E7DF", textAlign: "center"}}>Add a Report</Text>
                </Pressable>

            </View>

        </View>
    )
}