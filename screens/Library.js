//<Imports>

//React
import React, { useContext, useEffect, useState } from 'react';
import { Modal, Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, FlatList, SafeAreaView, TouchableWithoutFeedback, ScrollView } from 'react-native';

//Expo
import { LinearGradient } from 'expo-linear-gradient';

//Internal

//</Imports>


export default function Library() {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#131313', }}>
            <View style={styles.headerContainer}>
                <Text style={{ ...styles.textStyle, fontSize: 40, textAlign: 'left', width: '100%', marginStart: '5%' }}>Library</Text>
            </View>
            <LinearGradient colors={['#0e0e0e', '#12121200']} style={styles.graadientBackground} />
            <ScrollView style={styles.scroll}>
                <Text style={{ ...styles.textStyle, textAlignVertical: 'center', alignSelf: 'center', marginTop: 250 }}>Not implemented</Text>
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
});