import { Pressable, StyleSheet, Text, TouchableOpacity, View, Animated, Easing } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { FontAwesome6 } from '@expo/vector-icons';
import { Context } from '../../ContextProvider';
import { ProgressBar } from 'react-native-paper';
import { albumNeedsMigrationAsync } from 'expo-media-library';
import { err } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FOOTER_SETTINGS_KEY } from '../../SettingsHandler';
import { Slider } from '@miblanchard/react-native-slider';

const CurrentSongFooter = () => {
    //console.log(item);

    const { ah, sh } = useContext(Context);
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [long, setLong] = useState('#005982');

    const [openSoundbar, setOpenSoundbar] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const popUpHeight = useState(new Animated.Value(50))[0];
    const opacitySlider = useState(new Animated.Value(50))[0];
    const opacityBottom = useState(new Animated.Value(50))[0];
    const [sliding, setSliding] = useState(false);
    const [toChange, setToChange] = useState(0);
    const [curDuration, setCurDuration] = useState(0);

    const [footerSettings, setFooterSettings] = useState({
        shuffle: false,
        previous: false,
        play: false,
        next: false
    });

    useEffect(() => {
        ah.listeners.push({
            update: (data) => {
                setName(data?.NAME);
                setArtist(data?.ARTIST);
            },
            updateProgress: (num) => setProgress(num),
            updateIsPlaying: (bool) => setIsPlaying(bool),
            updateDuration: (num) => { setCurDuration(num) },
        });
        sh.listeners.push({
            update: setFooterSettings
        });
        loadInitialStorage = async () => {
            let jsonData = await AsyncStorage.getItem(FOOTER_SETTINGS_KEY);
            console.log(jsonData);
            setFooterSettings(JSON.parse(jsonData));
        }
        loadInitialStorage();
    }, []);

    useEffect(() => {
        if (ah.cur) {
            const getDuration = async () => {
                let status = await ah.cur.getStatusAsync();
                setCurDuration(status.durationMillis);
            }
            getDuration();
        }
    }, [name]);

    useEffect(() => {
        if (openSoundbar) {
            //bottom of footer progress opacity
            Animated.timing(opacityBottom, {
                toValue: 0,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start();
            Animated.timing(popUpHeight, {
                toValue: 130,
                duration: 250,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
            }).start(() => { setAnimationComplete(true) });

        } else {
            //popup slider opacity
            Animated.timing(opacitySlider, {
                toValue: 0,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start(() => {
                setAnimationComplete(false);
                Animated.timing(popUpHeight, {
                    toValue: 50,
                    duration: 250,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: false,
                }).start();
                //bottom of footer progress opacity
                Animated.timing(opacityBottom, {
                    toValue: 1,
                    duration: 100,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }).start();
            });


        }
    }, [openSoundbar]);

    useEffect(() => {
        if (animationComplete) {
            //popup slider opacity
            Animated.timing(opacitySlider, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start();
        }
    }, [animationComplete]);

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

    function millisecondsToTime(ms) {
        // Convert milliseconds to total seconds
        let totalSeconds = Math.floor(ms / 1000);

        // Calculate minutes and seconds
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        // Format the output as 'mm:ss'
        let formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        return formattedTime;
    }

    const resetStorage = async () => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.log(error);
        }
    }

    const setPosition = async () => {
        if (ah.cur._loaded) {
            await ah.cur.setPositionAsync(Math.round(toChange * curDuration));
        }
        setSliding(false);
    }

    return name && (
        <>
            <Animated.View style={[styles.popup, { height: popUpHeight, backgroundColor: long, }]}>
                <Animated.View style={{ width: '95%', marginStart: '2.5%', marginTop: '2.5%', opacity: opacitySlider }}>
                    {animationComplete && (<Slider
                        value={sliding ? toChange : progress}
                        onValueChange={(val) => { if (sliding) setToChange(val) }}
                        onSlidingStart={() => { setToChange(progress); setSliding(true) }}
                        onSlidingComplete={setPosition}
                        minimumValue={0}
                        maximumValue={1}
                        animationType='timing'
                        minimumTrackTintColor='white'
                        maximumTrackTintColor='#ffffff55'
                        thumbTintColor='white'
                        thumbStyle={sliding ? { width: 20, height: 20 } : { width: 10, height: 10 }}
                        thumbTouchSize={{ width: 10, height: 10 }}
                    />)}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', bottom: 10 }}>
                        <Text style={styles.time}>{sliding ? millisecondsToTime(Math.round(toChange * curDuration)) : millisecondsToTime(Math.round(progress * curDuration))}</Text>
                        <Text style={styles.time}>-{sliding ? millisecondsToTime(curDuration - Math.round(toChange * curDuration)) : millisecondsToTime(curDuration - Math.round(progress * curDuration))}</Text>
                    </View>
                </Animated.View>
            </Animated.View>
            <TouchableOpacity
                activeOpacity={1}
                onLongPress={() => { setLong('#005982'); setOpenSoundbar(!openSoundbar); }}
                onPress={() => console.log(ah)}
                onPressIn={() => { setLong('#0f0f0f') }}
                onPressOut={() => { setLong('#005982') }}
                style={[styles.button, { backgroundColor: long }]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.songContainer}>
                        <View style={{ height: 40, width: 40, backgroundColor: 'white', borderRadius: 5, marginStart: '5%' }}>
                            {/* Thumbnail image goes here */}
                        </View>
                        <View style={{ flexDirection: 'column', marginStart: '5%', justifyContent: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 12, marginBottom: '4%' }}>{name}</Text>
                            <Text style={{ color: '#c4c4c4', fontSize: 12 }}>{artist}</Text>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>

                        {footerSettings.shuffle && (
                            <TouchableOpacity style={styles.vectorButton} onPress={() => { console.log('shuffle click') }} activeOpacity={0.6}>
                                <FontAwesome6 name="shuffle" size={30} color="white" />
                            </TouchableOpacity>
                        )}

                        {footerSettings.previous && (
                            <TouchableOpacity style={styles.vectorButton} onPress={() => { ah?.playPrev(ah?.songs) }} activeOpacity={0.6}>
                                <FontAwesome6 name="backward" size={30} color="white" />
                            </TouchableOpacity>
                        )}

                        {footerSettings.play && (
                            <View style={[styles.vectorButton, { justifyContent: 'center', alignItems: 'center', width: '23%', }]}>
                                <TouchableOpacity onPress={handlePausePlay} activeOpacity={0.6}>
                                    {isPlaying ?
                                        (<FontAwesome6 name="pause" size={30} color="white" />)
                                        :
                                        (<FontAwesome6 name="play" size={30} color="white" />)
                                    }
                                </TouchableOpacity>
                            </View>
                        )}

                        {footerSettings.next && (
                            <TouchableOpacity style={styles.vectorButton} onPress={() => { ah?.playNext(ah?.songs) }} activeOpacity={0.6}>
                                <FontAwesome6 name="forward" size={30} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                </View>

                <Animated.View style={{ width: '95%', position: 'absolute', top: 57, alignSelf: 'center', opacity: opacityBottom }}>
                    <ProgressBar style={styles.progress} progress={progress} color='white' />
                </Animated.View>
            </TouchableOpacity >
        </>
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
        zIndex: 0
    },
    popup: {
        width: '95%',
        height: 50,
        position: 'absolute',
        backgroundColor: '#005982',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        borderRadius: 8,
        bottom: 100,
        zIndex: 0
    },
    progress: {
        height: 2,
        backgroundColor: '#ffffff55',
        alignSelf: 'center',
        position: 'absolute',
        borderRadius: 10,
    },
    songContainer: {
        flexDirection: 'row',
        width: '50%',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '50%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    vectorButton: {
        paddingHorizontal: '5%',
    },
    time: {
        color: '#b8b8b8',

    },
})