import { Pressable, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { AudioContext } from '../../AudioProvider';
import { ProgressBar } from 'react-native-paper';

const CurrentSongFooter = () => {
    //console.log(item);

    const ah = useContext(AudioContext);
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        ah.listeners.push({
            update: (data) => {
                setName(data?.NAME);
                setArtist(data?.ARTIST);
            },
            updateProgress: (num) => setProgress(num),
            updateIsPlaying: (bool) => setIsPlaying(bool),
        });
    }, []);

    const handlePausePlay = () => {
        try {
            if (isPlaying) {
                ah.pause();
            } else {
                ah.play();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.log('handlePausePlayError:', error);
        }
    }

    return name && (
        <TouchableOpacity activeOpacity={1} onPress={() => console.log(ah)} style={styles.button}>
            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                <View style={{ height: 40, width: 40, backgroundColor: 'white', borderRadius: 5, marginStart: '2.5%' }}>
                    {/* Thumbnail image goes here */}
                </View>
                <View style={{ flexDirection: 'column', marginStart: '3%' }}>
                    <Text style={{ color: 'white', fontSize: 12, marginBottom: '4%' }}>{name}</Text>
                    <Text style={{ color: '#c4c4c4', fontSize: 12 }}>{artist}</Text>
                </View>

                <TouchableOpacity onPress={handlePausePlay} activeOpacity={0.6} style={{ alignSelf: 'center', position: 'absolute', left: 330 }}>
                    {isPlaying ?
                        (<FontAwesome6 name="pause" size={30} color="white" />)
                        :
                        (<FontAwesome6 name="play" size={30} color="white" />)
                    }
                </TouchableOpacity>

            </View>

            <View style={{ width: '95%', position: 'absolute', top: 57, alignSelf: 'center' }}>
                <ProgressBar style={styles.progress} progress={progress} color='white' />
            </View>
        </TouchableOpacity>
    );
}

export default CurrentSongFooter

const styles = StyleSheet.create({
    button: {
        width: '95%',
        height: '7%',
        position: 'absolute',
        backgroundColor: '#005982',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        bottom: 100,
    },
    progress: {
        height: 2,
        backgroundColor: '#ffffff55',
        alignSelf: 'center',
        position: 'absolute',
        borderRadius: 10,
    },
})