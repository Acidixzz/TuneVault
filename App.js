import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Library, Songs, Settings } from './screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 90,
    backgroundColor: "#171717CC",
    borderTopWidth: 0,
  },
};

const tabs = {
  library: 0,
  songs: 1,
  settings: 2
}

export default function App() {
  const [current, setCurrent] = useState(0);

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator screenOptions={screenOptions}>
          <Tab.Screen
            name="Library"
            component={Library}
            options={{
              tabBarIcon: ({ focused }) => {
                return (
                  <View style={styles.navSection}>
                    <MaterialIcons name="library-music" size={36} color={focused ? "white" : "#999"} />
                    <Text style={[styles.label, { color: focused ? "white" : "#999" }]}>Library</Text>
                  </View>
                )
              },
            }} />
          <Tab.Screen
            name="Songs"
            component={Songs}
            options={{
              tabBarIcon: ({ focused }) => {
                return (
                  <View style={styles.navSection}>
                    <MaterialIcons name="add-box" size={36} color={focused ? "white" : "#999"} />
                    <Text style={[styles.label, { color: focused ? "white" : "#999" }]}>Songs</Text>
                  </View>
                )
              },
            }} />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              tabBarIcon: ({ focused }) => {
                return (
                  <View style={styles.navSection}>
                    <MaterialCommunityIcons name="cog" size={36} color={focused ? "white" : "#999"} />
                    <Text style={[styles.label, { color: focused ? "white" : "#999" }]}>Settings</Text>
                  </View>
                )
              },
            }} />
        </Tab.Navigator>
      </NavigationContainer>

      {/* <NavigationContainer>
        <Stack.Navigator initialRouteName='Welcome' screenOptions={
          {headerShown: false, 
           gestureEnabled: true, 
           customAnimationOnGesture: true,
           fullScreenGestureEnabled: true,
           gestureDirection: 'horizontal'}
        }>

          <Stack.Screen name="Welcome" component={Welcome}/>
          <Stack.Screen name="Settings" component={Settings}/>
        </Stack.Navigator>
      </NavigationContainer> */}
    </>
  )
}

const styles = StyleSheet.create({
  navSection: {
    alignItems: "center",
    justifyContent: "center",
    top: 0,
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
    top: 5,
  }
});
