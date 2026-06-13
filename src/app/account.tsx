import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/FireabseConfig";

export default function Account() {

  const [loading, setLoading] = useState(false);
  const player = useVideoPlayer(require("./assets/Catronaut.mp4"), player => {
    player.loop = true;
    player.play();
  });
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

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Logged in:", userCredential.user.email);
      setLoading(false);
      router.push('/dashboard');

    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleSignUp = async () => {
    if (newEmail !== confirmEmail) {
      alert("Email and confirm email didn't match!");
      return;
    }

    try {
      setLoading(true);

      //check if operator exists
      const operatorRef = doc(db, "operators", inviteCode);
      const operatorSnap = await getDoc(operatorRef);

      if (!operatorSnap.exists()) {
        alert("Invalid invite code!");
        setLoading(false);
        return;
      }

      //create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail,
        newPassword
      );

      const firebaseUser = userCredential.user;

      //send verification
      await sendEmailVerification(firebaseUser);

      //save driver globally
      await setDoc(doc(db, "drivers", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        operatorId: inviteCode,
        createdAt: Date.now(),
      });

      router.replace("/components/Verify");

    } catch (error: any) {
      console.log(error.code);
      console.log(error.message);
      alert(error.message);
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

  return (
    <SafeAreaView style={{ flex: 1 }}>

      {!signUp && <View style={{flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#ededed", padding: 32}}>

        <View style={{flex: 6, width: "100%", alignItems: "center", justifyContent: "center", gap: 12}}>
          <Text style={{ fontSize: 32, marginBottom: 20, color: "#141215", fontFamily: "Poppins_700Bold", textAlign: "center" }}>
            Sign In
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 20, color: "#141215", fontFamily: "Poppins_400Regular", textAlign: "center" }}>    
            Sign in to continue managing your vehicles with vask.
          </Text>

          <TextInput value={email} onChangeText={setEmail} placeholder="Email" 
            style={{width: "100%", borderWidth: 1, borderColor: "#141215", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
          
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#141215",
              borderRadius: 32,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                paddingVertical: 16,
                fontSize: 16,
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
              backgroundColor: "#141215",
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
          <Text style={{ fontSize: 32, marginBottom: 20, color: "#141215", fontFamily: "Poppins_700Bold", textAlign: "center" }}>
            Create an Account
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 20, color: "#141215", fontFamily: "Poppins_400Regular", textAlign: "center" }}>    
            Sign up to start managing your vehicles with vask.
          </Text>

          <TextInput value={newEmail} onChangeText={setNewEmail} placeholder="Email" style={{width: "100%", borderWidth: 1, borderColor: "#141215", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
          <TextInput value={confirmEmail} onChangeText={setConfirmEmail} placeholder="Confirm Email" style={{width: "100%", borderWidth: 1, borderColor: "#141215", borderRadius: 32, padding: 16, fontSize: 16}}></TextInput>
          
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#141215",
              borderRadius: 32,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              value={newPassword} 
              onChangeText={setNewPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                paddingVertical: 16,
                fontSize: 16,
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
            style={{
              width: "100%",
              borderWidth: 1,
              borderColor: "#141215",
              borderRadius: 32,
              padding: 16,
              fontSize: 16
            }}
          />
          <TextInput
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Mobile Number"
            style={{
              width: "100%",
              borderWidth: 1,
              borderColor: "#141215",
              borderRadius: 32,
              padding: 16,
              fontSize: 16
            }}
          />

          <Pressable
            onPress={handleSignUp}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 32,
              backgroundColor: "#141215",
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
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