import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ProfileTab() {

    const [points, setPoints] = useState("0");
    
    return (
        <View style={{flex: 1, width: "100%"}}>

            <View style={{flex: 1, width: "100%", alignItems: 'center', justifyContent: 'center' }}>

                <View style={{flex: 1, width: "100%"}}>

                    <Pressable style={{position: 'absolute', right: 0, bottom: 0, borderRadius: 100, backgroundColor: "#455A64", 
                        padding: 6, margin: 12}}
                        onPress={() => alert("Change background image")}>
                        <MaterialIcons
                            name="edit"
                            size={18}
                            color= "#E5E7DF"
                        />
                    </Pressable>

                </View>

                <View style={{flex: 1, width: "100%", alignItems: 'center', justifyContent: 'center', gap: 12, position: 'absolute'}}>
                    {/* IMG */}
                    <View style={{height: 120, width: 120, backgroundColor: "#E5E7DF", borderRadius: 100,
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Pressable style={{position: 'absolute', right: 0, bottom: 0, borderRadius: 100, backgroundColor: "#455A64", padding: 6}}
                            onPress={() => alert("Change profile picture")}>
                            <MaterialIcons
                                name="edit"
                                size={18}
                                color= "#E5E7DF"
                            />
                        </Pressable>
                    </View>
                    {/* Points */}
                    <Pressable style={{flexDirection: 'row', gap: 12, backgroundColor: "#E5E7DF", padding: 12, borderRadius: 24}}>
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

            <View style={{flex: 1, width: "100%", alignItems: 'center', justifyContent: 'flex-start',
                    backgroundColor: "#E5E7DF", padding: 24}}>
                
                {/* vehicle */}
                <View style={{width: "100%", alignItems: 'flex-start', justifyContent: 'center', 
                    borderBottomWidth: 1, borderColor: "grey", padding: 12, paddingBottom: 24, gap: 12}}>
                    
                    <Text style={{fontSize: 16, color: "#455A64", fontWeight: 'bold'}}>Registered Vehicle: </Text>

                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Vehicle Id: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>KASD9SIODS</Text>
                    </View>
                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Driver Name: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>Hello @Vask</Text>
                    </View>
                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Operator Id: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>0H29SI8KSV</Text>
                    </View>
                    <View style={{width: "100%", flexDirection: 'row', justifyContent: 'space-between'}}>             
                        <Text style={{fontSize: 16, color: "#455A64"}}>Date Started: </Text>
                        <Text style={{fontSize: 16, color: "#455A64"}}>01 / 01 / 2101</Text>
                    </View>
    
                </View>

                <View style={{width: "100%", flexDirection: "row", alignItems: 'center', justifyContent: 'center', 
                    borderBottomWidth: 1, borderColor: "grey", paddingInline: 12, paddingBlock: 24, gap: 12}}>

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
                </View>

                <Pressable style={{width: "100%", flexDirection: "row", alignItems: 'center', justifyContent: 'center', 
                    padding: 12, gap: 12, marginTop: 'auto', backgroundColor: "#455A64", borderRadius: 100}}
                    onPress={() => alert("Sign out")}>

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