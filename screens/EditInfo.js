//<Imports>

//React
import React, { forwardRef, useContext, useEffect, useState } from 'react';
import { Modal, Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, FlatList, SafeAreaView, TouchableWithoutFeedback, Platform, Image, TextInput } from 'react-native';
//import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import ColorPicker, { Panel1, Swatches, OpacitySlider, HueSlider, colorKit, PreviewText, Panel2 } from 'reanimated-color-picker';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';


//Expo
import { FontAwesome, FontAwesome6, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

//Internal
import emitter, { UPDATE_SONG } from '../util/EventEmitter';
import { Context, notify } from '../util/ContextProvider';


//</Imports>



const EditInfo = forwardRef((props, ref) => {

    const { sh, ah } = useContext(Context);

    const [name, setName] = useState(props.song.NAME);
    const [artist, setArtist] = useState(props.song.ARTIST);
    const [imageBase64, setImageBase64] = useState(props.song.PICTURE);
    const [imageUri, setImageUri] = useState('');

    const color = useSharedValue(props.song.COLOR); //for smooth ui
    const [updateColor, setUpdateColor] = useState(props.song.COLOR); // to update db
    const backgroundColorStyle = useAnimatedStyle(() => ({ backgroundColor: color.value }));
    const onColorSelect = (newColor) => {
        'worklet';
        color.value = newColor.hex;
    };

    const [numberOfButtons, setNumberOfButtons] = useState(0);

    useEffect(() => {
        let num = 0;
        if (sh.footerSettings?.shuffle) num += 1;
        if (sh.footerSettings?.previous) num += 1;
        if (sh.footerSettings?.play) num += 1;
        if (sh.footerSettings?.next) num += 1;
        setNumberOfButtons(num);
    })

    const pickImage = async () => {
        // Request permission to access the media library
        try {

            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                console.log(status);
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                    return;
                }
            }

            // Launch the image library
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                base64: true,
                quality: 1,
            });

            // If the user cancels the picker, do nothing
            if (result.canceled) {
                return;
            }

            const { uri, width, height } = result.assets[0];

            // Calculate the size and position for the square crop
            const squareSize = Math.min(width, height);
            const cropArea = {
                originX: (width - squareSize) / 2,
                originY: (height - squareSize) / 2,
                width: squareSize,
                height: squareSize,
            };

            // Perform the cropping operation
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ crop: cropArea }, { resize: { width: 400, height: 400 } }],
                { compress: 0, format: ImageManipulator.SaveFormat.PNG, base64: true }
            );
            // Update the state with the new image URI
            setImageUri(manipResult.uri);
            setImageBase64(manipResult.base64);
        } catch (error) {
            console.log('pickImageError:', error);
        }
    };

    const takePhoto = async () => {
        try {
            // Request permission to access the camera
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                console.log(status);
                if (status !== 'granted') {
                    alert('Sorry, we need camera permissions to make this work!');
                    return;
                }
            }

            // Launch the camera
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                base64: true,
                quality: 1,
            });

            // If the user cancels the picker, do nothing
            if (result.canceled) {
                return;
            }

            const { uri, width, height } = result.assets[0];

            // Calculate the size and position for the square crop
            const squareSize = Math.min(width, height);
            const cropArea = {
                originX: (width - squareSize) / 2,
                originY: (height - squareSize) / 2,
                width: squareSize,
                height: squareSize,
            };

            // Perform the cropping operation
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ crop: cropArea }, { resize: { width: 400, height: 400 } }],
                { compress: 0, format: ImageManipulator.SaveFormat.PNG, base64: true }
            );

            // Update the state with the new image URI
            setImageUri(manipResult.uri);
            setImageBase64(manipResult.base64);
        } catch (error) {
            console.log('takePhotoError:', error);
        }
    };

    const mediaAlert = () => {
        Alert.alert('Choose Image', '', [
            { text: 'Take photo', onPress: takePhoto },
            { text: 'Choose from library', onPress: pickImage },
            { text: 'Remove current image', onPress: () => { setImageBase64(''); setImageUri('') } },
            { text: 'Cancel', style: 'cancel' },
        ],
            { cancelable: true }
        );
    }

    const rotate = async (direction) => {
        try {
            if (!!imageUri) {
                const manipResult = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [{ rotate: direction === 'right' ? 90 : -90 }],
                    { compress: 0, format: ImageManipulator.SaveFormat.PNG, base64: true }
                );
                setImageUri(manipResult.uri);
                setImageBase64(manipResult.base64);
            } else if (imageBase64) {
                const fileUri = `${FileSystem.cacheDirectory}temp.png`;

                await FileSystem.writeAsStringAsync(fileUri, imageBase64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const manipResult = await ImageManipulator.manipulateAsync(
                    fileUri,
                    [{ rotate: direction === 'right' ? 90 : -90 }],
                    { compress: 0, format: ImageManipulator.SaveFormat.PNG, base64: true }
                );
                setImageUri(manipResult.uri);
                setImageBase64(manipResult.base64);
            }
        } catch (error) {
            console.log('rotateError:', error);
        }
    }

    const save = async () => {
        try {
            if (imageUri || imageBase64) {
                const fileUri = `${FileSystem.cacheDirectory}temp.png`;

                await FileSystem.writeAsStringAsync(fileUri, imageBase64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const manipResult = await ImageManipulator.manipulateAsync(
                    !!imageUri ? imageUri : fileUri,
                    [{ resize: { width: 400, height: 400 } }],
                    { compress: 0, format: ImageManipulator.SaveFormat.PNG, base64: true }
                );
                emitter.emit(UPDATE_SONG, props.song, name !== props.song.NAME ? name : '', artist !== props.song.ARTIST ? artist : '', manipResult.base64, updateColor !== props.song.COLOR ? updateColor : '', props.song?.SONG_GU);
            } else {
                emitter.emit(UPDATE_SONG, props.song, name !== props.song.NAME ? name : '', artist !== props.song.ARTIST ? artist : '', null, updateColor !== props.song.COLOR ? updateColor : '', props.song?.SONG_GU);
            }
            ref.current.close();
        } catch (error) {
            console.log('saveError:', error);
        }
    }

    return (
        <>
            <View style={{ height: 60, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c1c1c', borderTopStartRadius: 10, borderTopEndRadius: 10 }}>
                <TouchableOpacity style={styles.editButton} onPress={() => { ref.current.close() }}>
                    <Text style={[styles.textStyle, { textAlign: 'left', paddingStart: '20%' }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.textBoldStyle, { fontSize: 20, width: '50%' }]} numberOfLines={1}>Edit Song</Text>
                <TouchableOpacity disabled={name === props.song.NAME && artist === props.song.ARTIST && imageBase64 === props.song.PICTURE && updateColor === props.song.COLOR} style={styles.editButton} onPress={() => { save() }}>
                    <Text style={[styles.textStyle, { textAlign: 'right', paddingEnd: '20%' }, name === props.song.NAME && artist === props.song.ARTIST && imageBase64 === props.song.PICTURE && updateColor === props.song.COLOR && { color: '#838383' }]}>Save</Text>
                </TouchableOpacity>
            </View>
            <LinearGradient colors={['#0e0e0e', '#12121200']} style={styles.graadientBackground} />
            <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#131313', }}>

                <ScrollView style={styles.scroll} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', width: '100%', }}>

                    <TouchableOpacity onPress={mediaAlert} style={[styles.image, { shadowColor: '#000000', shadowOffset: [0, 0], shadowOpacity: 0.5, marginTop: 20 }, { backgroundColor: 'white' }]}>
                        {!!imageBase64 &&
                            (
                                <Image source={{ uri: `data:image/png;base64,${imageBase64}` }} style={styles.image} />
                            )
                        }
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', }}>
                        {!!!imageBase64 ?
                            (
                                <TouchableOpacity style={{ height: 60, width: 100, justifyContent: 'center' }} onPress={mediaAlert}>
                                    <Text style={{ ...styles.textBoldStyle, textAlignVertical: 'center', alignSelf: 'center', }}>Choose Image</Text>
                                </TouchableOpacity>
                            )
                            :
                            (
                                <>
                                    <TouchableOpacity style={styles.rotate} onPress={() => rotate('left')}>
                                        <FontAwesome name="rotate-left" size={24} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.rotate} onPress={() => rotate('right')}>
                                        <FontAwesome name="rotate-right" size={24} color="white" />
                                    </TouchableOpacity>
                                </>
                            )
                        }
                    </View>

                    <TextInput value={name} onChangeText={setName} autoCorrect={false} autoComplete='off' style={{ marginTop: 20, borderBottomWidth: 1, borderColor: 'white', width: '85%', paddingBottom: 2, fontSize: 30, color: 'white', textAlign: 'center' }} placeholder='Name' />
                    <TextInput value={artist} onChangeText={setArtist} autoCorrect={false} autoComplete='off' style={{ marginTop: 60, borderBottomWidth: 1, borderColor: 'white', width: '85%', paddingBottom: 2, fontSize: 30, color: 'white', textAlign: 'center' }} placeholder='Artist' />

                    <Animated.View style={{ width: '60%', marginVertical: '10%', flex: 1 }}>
                        <ColorPicker
                            value={color.value}
                            sliderThickness={25}
                            thumbSize={24}
                            thumbShape='circle'
                            onChange={onColorSelect}
                            boundedThumb
                        >
                            <Panel1 style={styles.panelStyle} />
                            <HueSlider style={styles.sliderStyle} />
                            <View style={styles.previewTxtContainer} />
                            <Text style={{ color: '#707070', textAlign: 'center', marginBottom: 10, alignSelf: 'center' }}>Preview</Text>
                            <Animated.View style={[backgroundColorStyle, styles.footerButton]}>
                                <TouchableOpacity style={styles.footerButton} onPress={() => setUpdateColor(color.value)}>
                                    <View style={{ width: '50%', flexDirection: 'row' }}>
                                        <View style={{ height: 40, width: 40, backgroundColor: 'white', borderRadius: 5, marginStart: 10, shadowColor: '#000000', shadowOpacity: .25, shadowOffset: [0, 0], alignSelf: 'center' }}>
                                            {!!imageBase64 && (<Image source={{ uri: `data:image/png;base64,${imageBase64}` }} style={{ width: 40, height: 40, borderRadius: 5 }} />)}
                                        </View>
                                        <View style={{ flexDirection: 'column', marginStart: '5%', justifyContent: 'center', height: 40, width: 300 - 45 * numberOfButtons }}>
                                            <Text style={{ color: 'white', fontSize: 12, marginBottom: 5, }} numberOfLines={1}>{name}</Text>
                                            <Text style={{ color: '#c4c4c4', fontSize: 12 }} numberOfLines={1}>{artist}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.buttonContainer]}>
                                        {sh.footerSettings?.shuffle && (
                                            <View style={styles.vectorButton}>
                                                <FontAwesome6 name="shuffle" size={30} color="white" />
                                                {props.shuffle && (<Entypo style={{ marginVertical: '-25%', marginLeft: 2 }} name="dot-single" size={24} color="white" />)}
                                            </View>
                                        )}

                                        {sh.footerSettings?.previous && (
                                            <View style={styles.vectorButton}>
                                                <FontAwesome6 name="backward" size={30} color="white" />
                                            </View>
                                        )}

                                        {sh.footerSettings?.play && (
                                            <View style={[styles.vectorButton, { justifyContent: 'center', alignItems: 'center', width: '23%', }]}>
                                                <FontAwesome6 name="play" size={30} color="white" />
                                            </View>
                                        )}

                                        {sh.footerSettings?.next && (
                                            <View style={styles.vectorButton}>
                                                <FontAwesome6 name="forward" size={30} color="white" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        </ColorPicker>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
});

export default EditInfo;

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
        textAlignVertical: 'center',
        // borderWidth: 1,
        // borderColor: 'red',

    },
    textBoldStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    graadientBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 60,
        height: 10,
        zIndex: 1000
    },
    scroll: {
        height: 400,
        width: '100%',
    },
    image: {
        width: 200,
        height: 200,
    },
    rotate: {
        height: 60,
        width: 60,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: '5%'
        // borderWidth: 1,
        // borderColor: 'red'
    },
    editButton: {
        height: 60,
        width: '20%',
        justifyContent: 'center',
        // borderWidth: 1,
        // borderColor: 'red',
    },
    panelStyle: {
        borderRadius: 16,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    sliderStyle: {
        borderRadius: 20,
        marginTop: 20,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    previewTxtContainer: {
        paddingTop: 10,
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: '#bebdbe',
    },
    footerButton: {
        width: 370,
        height: 60,
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
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
});