//<Imports>

//React
import React, { useContext, useEffect, useState } from 'react';
import { Modal, Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, FlatList, SafeAreaView, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Switch } from 'react-native-paper';

//Expo
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

//Internal
import { Context } from '../util/ContextProvider';

//</Imports>




export default function Settings() {

    // const [shuffle, setShuffle] = useState(false);
    // const [previous, setPrevious] = useState(false);
    // const [play, setPlay] = useState(false);
    // const [next, setNext] = useState(false);
    const { ah, sh } = useContext(Context);
    const [footerSettings, setFooterSettings] = useState({
        shuffle: false,
        previous: false,
        play: false,
        next: false
    });

    useEffect(() => {
        getData = async () => {
            if (sh.footerSettings) {
                setFooterSettings(sh.footerSettings);
            }
        }
        getData();
    }, [])

    useEffect(() => {
        try {
            setData = async () => {
                await sh.updateFooterSettings(footerSettings);
            }
            setData();
        } catch (error) {
            console.log('SettingsUseEffect', error);
        }

    }, [footerSettings]);

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#131313', }}>
            <View style={styles.headerContainer}>
                <Text style={{ ...styles.textStyle, fontSize: 40, textAlign: 'left', width: '100%', marginStart: '5%' }}>Settings</Text>
            </View>
            <LinearGradient colors={['#0e0e0e', '#12121200']} style={styles.graadientBackground} />
            <ScrollView style={styles.scroll}>
                <Text style={styles.normalText}>Show Buttons On Footer</Text>
                <View style={styles.groupBox}>
                    {/*---Shuffle--- */}
                    <View style={styles.toggleComponent}>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={[styles.icon, footerSettings.shuffle && { backgroundColor: '#17b6ff' }]}>
                                <FontAwesome6 name="shuffle" size={20} color="white" />
                            </View>
                            <Text style={[styles.textStyle, { paddingStart: '5%' }]}>Shuffle</Text>
                        </View>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', paddingEnd: '2.5%' }}>
                            <Switch value={footerSettings.shuffle} color="#17b6ff" onValueChange={() => { setFooterSettings({ ...footerSettings, shuffle: !footerSettings.shuffle }) }} />
                        </View>
                    </View>

                    {/*---Prev--- */}
                    <View style={styles.toggleComponent}>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={[styles.icon, footerSettings.previous && { backgroundColor: '#17b6ff' }]}>
                                <FontAwesome6 name="backward" size={20} color="white" />
                            </View>
                            <Text style={[styles.textStyle, { paddingStart: '5%' }]}>Previous</Text>
                        </View>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', paddingEnd: '2.5%' }}>
                            <Switch value={footerSettings.previous} color="#17b6ff" onValueChange={() => { setFooterSettings({ ...footerSettings, previous: !footerSettings.previous }) }} />
                        </View>
                    </View>

                    {/*---Pause/Play--- */}
                    <View style={styles.toggleComponent}>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={[styles.icon, footerSettings.play && { backgroundColor: '#17b6ff' }]}>
                                <FontAwesome6 name="play" size={20} color="white" />
                            </View>
                            <Text style={[styles.textStyle, { paddingStart: '5%' }]}>Pause/Play</Text>
                        </View>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', paddingEnd: '2.5%' }}>
                            <Switch value={footerSettings.play} color="#17b6ff" onValueChange={() => { setFooterSettings({ ...footerSettings, play: !footerSettings.play }) }} />
                        </View>
                    </View>

                    {/*---Next--- */}
                    <View style={[styles.toggleComponent, { borderBottomWidth: 0 }]}>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View style={[styles.icon, footerSettings.next && { backgroundColor: '#17b6ff' }]}>
                                <FontAwesome6 name="forward" size={20} color="white" />
                            </View>
                            <Text style={[styles.textStyle, { paddingStart: '5%' }]}>Next</Text>
                        </View>
                        <View style={{ width: '50%', justifyContent: 'flex-end', flexDirection: 'row', paddingEnd: '2.5%' }}>
                            <Switch value={footerSettings.next} color="#17b6ff" onValueChange={() => { setFooterSettings({ ...footerSettings, next: !footerSettings.next }) }} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'Center',
        alignItems: 'center',
        marginVertical: '5%',
        width: '100%',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    normalText: {
        color: '#5e5e5e',
        fontSize: 20,
        fontWeight: 'normal',
        textAlign: 'left',
        marginStart: '5%',
        marginVertical: '2%'
    },
    graadientBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '17.5%',
        height: 10,
        zIndex: 1000
    },
    scroll: {
        height: 400,
        width: '100%',
    },
    groupBox: {
        width: '94%',
        backgroundColor: '#1b1b1b',
        marginBottom: '5%',
        marginHorizontal: '3%',
        borderRadius: 10
    },
    toggleComponent: {
        width: '100%',
        paddingVertical: '2%',
        flexDirection: 'row',
        borderBottomWidth: 0.25,
        borderColor: '#5e5e5e'
    },
    icon: {
        marginStart: '5%',
        borderRadius: 8,
        height: 30,
        width: 30,
        backgroundColor: '#3c3c3c',
        justifyContent: 'center',
        alignItems: 'center'
    }
});