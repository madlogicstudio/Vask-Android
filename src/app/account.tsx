'use client'

import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/FireabseConfig";

export default function Account() {

  const [loading, setLoading] = useState(false);
  const player = useVideoPlayer(require("./assets/Catronaut.mp4"));
  // , player => {
  //   player.loop = true;
  //   player.play();
  // });
  const [showPassword, setShowPassword] = useState(false);
  const [signUp, setSignUp] = useState(false);

  const [fontsLoaded] = useFonts({
      Poppins_400Regular,
      Poppins_700Bold,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [noConnection, setNoConnection] = useState(false);

  const [driverId, setDriverId] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // const pushToken = (
      //   await Notifications.getExpoPushTokenAsync()
      // ).data;

      // console.log("Push Token:", pushToken);

      // await updateDoc(
      //   doc(db, "drivers", userCredential.user.uid),
      //   {
      //     expoPushToken: pushToken
      //   }
      // );

      console.log("Logged in:", userCredential.user.email);
      setLoading(false);
      router.push('/dashboard');

    } 
    catch (error: any) {
      console.log(error.code);

      switch (error.code) {
        case "auth/network-request-failed":
          setNoConnection(true);
          break;

        case "auth/invalid-credential":
          alert("Incorrect email or password.");
          break;

        case "auth/invalid-email":
          alert("Please enter a valid email address.");
          break;

        case "auth/user-disabled":
          alert("This account has been disabled.");
          break;

        case "auth/too-many-requests":
          alert("Too many failed login attempts. Please try again later.");
          break;

        default:
          alert("An unexpected error occurred.");
          console.log(error);
      }
    }
    finally {
      setLoading(false);
    }
  };
  
  //signup
  const handleSignUp = async () => {

    if (newEmail !== confirmEmail) {
      alert("Email and confirm email don't match.");
      return;
    }

    if (!inviteCode.trim()) {
      alert("Please enter an invite code.");
      return;
    }

    if (!contactNumber.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    try {
      setLoading(true);

      // Check if operator exists
      const operatorRef = doc(db, "operators", inviteCode);
      const operatorSnap = await getDoc(operatorRef);

      if (!operatorSnap.exists()) {
        alert("Invalid invite code.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail.trim(),
        newPassword
      );

      const firebaseUser = userCredential.user;

      await sendEmailVerification(firebaseUser);

      await setDoc(doc(db, "drivers", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        operatorId: inviteCode,
        contactNumber,
        createdAt: Date.now(),
      });

      router.replace("/components/Verify");

    } catch (error: any) {
      switch (error.code) {
        case "auth/network-request-failed":
          setNoConnection(true);
          break;

        case "auth/email-already-in-use":
          alert("An account with this email already exists.");
          break;

        case "auth/invalid-email":
          alert("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          alert("Password must be at least 6 characters.");
          break;

        default:
          alert("Something went wrong. Please try again.");
          console.log(error.code, error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

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

  if (noConnection) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12, backgroundColor: "white" }}>
        <Image
            source={require("./assets/404.png")}
            style={{
                width: 420,
                height: 420,
            }}
        />
        <Pressable style={{backgroundColor: "#455A64", padding: 12, borderRadius: 24}}
            onPress={() => {
              setNoConnection(false);
              router.replace("/account");
            }}>
            <Text style={{fontSize: 16, color: "#ededed", textAlign: "center", paddingInline: 24}}>Reload Page</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>

      {!signUp && <View style={{flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#ededed", padding: 32}}>

        <View style={{flex: 6, width: "100%", alignItems: "center", justifyContent: "center", gap: 12}}>
          <Text style={{ fontSize: 32, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_700Bold", textAlign: "center" }}>
            Sign In
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular", textAlign: "center" }}>    
            Sign in to continue managing your vehicles with vask.
          </Text>

          <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#455A64"
            style={{width: "100%", borderWidth: 1, borderColor: "#455A64", borderRadius: 32, padding: 16, fontSize: 16, color: "#455A64"}}></TextInput>
          
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#455A64",
              borderRadius: 32,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#455A64"
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                paddingVertical: 16,
                fontSize: 16,
                color: "#455A64",
              }}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#455A64"
              />
            </Pressable>
          </View>


          <Text style={{width: "100%", fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular", textAlign: "right" }}>    
            Forgot Password?
          </Text>

          <Pressable
            onPress={handleLogin}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 32,
              backgroundColor: "#455A64",
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
              Sign In
            </Text>
          </Pressable>

        </View>

        <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8}}>
          <Text style={{fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular"}}>    
            Don't have an account?
          </Text>
          <Pressable onPress={() => setSignUp(true)} style={{alignItems: "center", justifyContent: "center"}}>
            <Text style={{fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular"}}>    
              Sign up here
            </Text>
          </Pressable>
        </View>

      </View>}

      {signUp && <View style={{flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#ededed", padding: 32}}>

        <View style={{flex: 6, width: "100%", alignItems: "center", justifyContent: "center", gap: 12}}>
          <Text style={{ fontSize: 32, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_700Bold", textAlign: "center" }}>
            Create an Account
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular", textAlign: "center" }}>    
            Sign up to start managing your vehicles with vask.
          </Text>

          <TextInput value={newEmail} onChangeText={setNewEmail} placeholder="Email" placeholderTextColor="#455A64" style={{width: "100%", borderWidth: 1, borderColor: "#455A64", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
          <TextInput value={confirmEmail} onChangeText={setConfirmEmail} placeholder="Confirm Email" placeholderTextColor="#455A64" style={{width: "100%", borderWidth: 1, borderColor: "#455A64", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
          
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#455A64",
              borderRadius: 32,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              value={newPassword} 
              onChangeText={setNewPassword}
              placeholder="Password"
              placeholderTextColor="#455A64"
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                paddingVertical: 16,
                fontSize: 16,
                color: "#455A64"
              }}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#455A64"
              />
            </Pressable>
          </View>


          <Text style={{width: "100%", fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular", textAlign: "right" }}>    
            Forgot Password?
          </Text>

          <TextInput
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="Operator Invite Code"
            placeholderTextColor="#455A64"
            style={{
              width: "100%",
              borderWidth: 1,
              borderColor: "#455A64",
              borderRadius: 32,
              padding: 16,
              fontSize: 16,
              color: "#455A64"
            }}
          />
          <TextInput
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Mobile Number"
            placeholderTextColor="#455A64"
            style={{
              width: "100%",
              borderWidth: 1,
              borderColor: "#455A64",
              borderRadius: 32,
              padding: 16,
              fontSize: 16,
              color: "#455A64"
            }}
          />

          <Pressable
            onPress={handleSignUp}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 32,
              backgroundColor: "#455A64",
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
              Sign Up
            </Text>
          </Pressable>

        </View>

        <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8}}>
          <Text style={{fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular"}}>    
            Don't have an account?
          </Text>
          <Pressable onPress={() => setSignUp(false)} style={{alignItems: "center", justifyContent: "center"}}>
            <Text style={{fontSize: 16, marginBottom: 20, color: "#455A64", fontFamily: "Poppins_400Regular"}}>    
              Sign in here
            </Text>
          </Pressable>
        </View>

      </View>}
      
    </SafeAreaView>
  );
}