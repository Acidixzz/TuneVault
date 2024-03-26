import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Library, Songs, Settings } from './screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle:{
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 80,
    background: "#fff"
  } 
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={ screenOptions }>
        <Tab.Screen
         name="Library"
         component={ Library }
         options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ alignItems: "center", justifyContent: "center", top: 10 }}>
                <MaterialIcons name="library-music" size={36} color= {focused ? "blue" : "#999"} />
              </View>
            )
          }
         }}/>
        <Tab.Screen 
          name="Songs" 
          component={ Songs }
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <View style={{ alignItems: "center", justifyContent: "center", top: 10 }}>
                  <MaterialIcons name="add-box" size={36} color= {focused ? "blue" : "#999"} />
                </View>
              )
            }
          }} />
        <Tab.Screen 
          name="Settings" 
          component={ Settings }
          options={{
            tabBarIcon: ({focused}) => {
              return (
                <View style={{ alignItems: "center", justifyContent: "center", top: 10 }}>
                  <MaterialCommunityIcons name="cog" size={36} color= {focused ? "blue" : "#999"} />
                </View>
              )
            }
          }} />
      </Tab.Navigator>
    </NavigationContainer>
  )  
}
