import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Library, Songs, Settings } from './screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import 'react-native-gesture-handler';
import { createContext, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ContextProvider } from './ContextProvider';
import CurrentSongFooter from './screens/components/CurrentSongFooter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NotificationsProvider } from './ContextProvider';

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 100,
    borderTopWidth: 0,
  },
  tabBarBackground: () => (
    <LinearGradient colors={['#131313cc', '#131313']} style={styles.graadientBackground} />
  )
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
      <ContextProvider>
        <GestureHandlerRootView>
          <NotificationsProvider />
          <BottomSheetModalProvider>
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
            <CurrentSongFooter />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ContextProvider>
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
  },
  graadientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '-1%',
    height: 67,
  },
});
