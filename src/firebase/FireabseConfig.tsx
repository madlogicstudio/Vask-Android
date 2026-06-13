import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
// @ts-ignore: getReactNativePersistence exists in the RN bundle 
// but is often missing from public TypeScript definitions.
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADSClha0XPHut8fySmkEtr_YN2pqYKcVU",
  authDomain: "madlogicstudio-629a0.firebaseapp.com",
  projectId: "madlogicstudio-629a0",
  storageBucket: "madlogicstudio-629a0.appspot.com",
  messagingSenderId: "214707084650",
  appId: "1:214707084650:web:b2717069854edb43fc9913",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// SAFE: Expo-compatible Auth persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;