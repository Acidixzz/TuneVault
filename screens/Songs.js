//<Imports>

//React
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, SafeAreaView, TouchableWithoutFeedback, Animated, Easing, TouchableHighlight } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { ScrollView } from 'react-native-gesture-handler';
import { useNotificationController } from 'react-native-notificated';

//Expo
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import { Ionicons, createIconSetFromFontello, MaterialIcons, Entypo, Feather } from '@expo/vector-icons';

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
//Internal
import EditInfo from './EditInfo';
import { Context, notify } from '../util/ContextProvider';
import SongComponent from './components/SongComponent';
import emitter, { UPDATE_SONG } from '../util/EventEmitter';

//</Imports>

const Songs = ({ navigation }) => {
  const db = SQLite.openDatabaseSync('TuneVault.db');
  const { ah, sh } = useContext(Context);
  const [songs, setSongs] = useState([]);

  const [shuffle, setShuffle] = useState(false);

  //Toasts
  const { remove } = useNotificationController();
  const [curToast, setCurToast] = useState('');
  const [openSoundbar, setOpenSoundbar] = useState(false);


  const scrollRef = useRef(null);
  const scrollHeight = useState(new Animated.Value(125))[0];

  //variable to show the elipsis bottomsheet
  const songSettingsRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.8}{...props} />,
    []
  );
  //variable to show the elipsis bottomsheet
  const songEditRef = useRef(null);
  const editSnapPoints = useMemo(() => ['95%'], []);

  //current item for setting popup
  const [curSongForSettings, setCurSongForSettings] = useState(null);

  useEffect(() => {

    const fetchSongs = async () => {
      try {

        await db.withExclusiveTransactionAsync(async (txn) => {
          await txn.execAsync('CREATE TABLE IF NOT EXISTS songs (SONG_GU TEXT PRIMARY KEY, NAME TEXT NOT NULL, ARTIST TEXT, FILE_PATH TEXT NOT NULL, PICTURE TEXT, DATE_ADDED TEXT NOT NULL)');
        });

        await db.withExclusiveTransactionAsync(async (txn) => {
          const SELECT = await txn.getAllAsync('SELECT * FROM songs');
          setSongs(SELECT);
          //console.log(query);
          ah.songs = SELECT;
        });
      } catch (error) {
        console.log('select', error);
      }
    }
    fetchSongs();
    sh.listeners.push({
      openSoundbar: setOpenSoundbar,
      shuffle: setShuffle
    });

    emitter.addListener(UPDATE_SONG, updateRows);
  }, []);

  useEffect(() => {
    if (openSoundbar) {
      Animated.timing(scrollHeight, {
        toValue: 200,
        duration: 400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start();
    } else {
      setTimeout(() => {
        Animated.timing(scrollHeight, {
          toValue: 125,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }).start();
      }, 50);
    }
  }, [openSoundbar]);

  const setAllShuffles = async (shuffle) => {
    try {
      sh.listeners.forEach((item) => item.shuffle?.(shuffle));
    } catch (error) {
      console.log('setAllShufflesError', error);
    }
  }

  const pickMultipleSongs = async () => {
    try {

      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        alert("Permission to access audio files denied!");
        return;
      }

      const results = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "audio/*",
        copyToCacheDirectory: false,
      });

      console.log(results);

      // Handle the selected documents
      await insertRows(results);

    } catch (error) {
      if (results && results.canceled) {
        console.log('Document picking cancelled');
      } else {
        console.error('Error picking documents:', error);
      }
    }
  };

  const insertRows = async (files) => {
    try {
      const values = [];
      if (files.assets != null) {
        let query = 'INSERT INTO songs (SONG_GU, NAME, ARTIST, FILE_PATH, PICTURE, DATE_ADDED) VALUES ';
        let index = 0
        for (const file of files.assets) {
          query += `(${Array(6).fill('?').join(', ')})`;
          if (index < files.assets.length - 1) {
            query += ', ';
          }
          let gu = generateRandomGUID();
          await FileSystem.copyAsync({ from: file.uri, to: FileSystem.documentDirectory + gu + file.name });
          values.push(...[gu, file.name, 'Juice WRLD', FileSystem.documentDirectory + gu + file.name, null, new Date().toISOString()]);
          index++;
        }

        // console.log(query);
        // console.log(values);

        db.withExclusiveTransactionAsync(async (txn) => {
          console.log(txn.runSync(query, values));

          const SELECT = await txn.getAllAsync('SELECT * FROM songs');
          setSongs(SELECT);

        });
      }
    } catch (error) {
      console.error('Error inserting rows:', error);
    }
  }

  const deleteRows = async (song) => {
    try {
      db.withExclusiveTransactionAsync(async (txn) => {
        await txn.runAsync('DELETE FROM songs WHERE SONG_GU == ?', song.SONG_GU);
        await ah.reset();
        await FileSystem.deleteAsync(song.FILE_PATH);

        const SELECT = await txn.getAllAsync('SELECT * FROM songs');
        setSongs(SELECT);
        if (SELECT) {
          ah.setCurNextPrev(SELECT[0], SELECT);
        }
      });
    } catch (error) {
      console.log("Error deleting a song: ", error);
    }
  }

  const updateRows = async (name, artist, image, gu) => {
    try {
      const columns = [];
      const values = [];
      const newCurRow = { ...ah.curRow };

      if (!!name) {
        columns.push('NAME = ?');
        values.push(name);
        newCurRow.NAME = name;
      }

      if (!!artist) {
        columns.push('ARTIST = ?');
        values.push(artist);
        newCurRow.ARTIST = artist;
      }

      //no checker because we want to be able to remove the picture as well
      columns.push('PICTURE = ?');
      values.push(!!image ? image : null);
      newCurRow.PICTURE = !!image ? image : null;

      values.push(gu);
      console.log(columns);

      if (columns.length > 0) {
        await db.withExclusiveTransactionAsync(async (txn) => {
          await txn.runAsync(`UPDATE songs SET ${columns.join(', ')} WHERE SONG_GU == ?`, values);
        });

        await db.withExclusiveTransactionAsync(async (txn) => {
          const SELECT = await txn.getAllAsync('SELECT * FROM songs');
          setSongs(SELECT);
          if (SELECT) {
            ah.setCurNextPrev(newCurRow, SELECT, true);
          }
        });
      }
    } catch (error) {
      console.log('updateRowsError:', error);
    }
  }

  const generateRandomGUID = () => {
    // Generate a random hexadecimal string (8 characters)
    try {
      const randomHex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
      const guid = `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
      return guid.toUpperCase(); // Convert to uppercase for consistency
    } catch (error) {
      console.log("Error generating GUID: ", error);
    }
  }

  const settingsPopup = (song) => {
    try {
      setCurSongForSettings(song);
      songSettingsRef.current?.present();
    } catch (error) {
      console.log("Error loading modal window: ", error);
    }
  };

  const toastHandler = () => {
    remove(curToast);
    setCurToast(notify('queue', {
      params: {
        bottom: ah.cur._loaded ? openSoundbar ? 180 : 110 : 50
      },
      config: {
        gestureConfig: { direction: 'x' },
      },
    }).id);
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#131313', }}>


      <View style={styles.headerContainer}>
        <Text style={{ ...styles.textBoldStyle, fontSize: 40, textAlign: 'center', }}>Songs</Text>

        <TouchableOpacity onPress={pickMultipleSongs} style={styles.add}>
          <MaterialIcons name="add" size={36} color="black" />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={['#0e0e0e', '#12121200']} style={styles.graadientBackground} />
      <ScrollView style={{ width: '100%', maxHeight: '100%', backgroundColor: "#121212" }} ref={scrollRef}>
        {songs.map((item, index) => (
          <View key={index}>
            <View style={[{ flexDirection: 'row', marginTop: index == 0 ? '2%' : 0 }]}>
              <SongComponent ref={scrollRef} item={item} songs={songs} showEllipsis={true} settingFunc={settingsPopup} toastHandler={toastHandler} shuffle={shuffle} />
            </View>
            {index === songs.length - 1 && (<Animated.View style={{ height: scrollHeight }} />)}
          </View>
        ))}
      </ScrollView>

      <BottomSheetModal
        ref={songSettingsRef}
        snapPoints={snapPoints}
        index={0}
        key={'songSettings'}
        name={'songSettings'}
        enableDismissOnClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#222222' }}
        handleIndicatorStyle={{ backgroundColor: '#777777', width: 50 }}
      >
        <BottomSheetScrollView style={{ backgroundColor: '#222222', width: '100%' }}>
          <View style={{ flex: 1, marginTop: '1%' }}>
            <SongComponent item={curSongForSettings} ref={songSettingsRef}></SongComponent>
            <View style={{ backgroundColor: '#666666', height: 0.25, width: 400, marginVertical: '3%', zIndex: 2 }} />
            <TouchableHighlight underlayColor={'#000000'} style={[styles.button, { width: '100%', flexDirection: 'row', alignItems: 'center' }]} onPress={() => { songSettingsRef.current?.close(); toastHandler(); ah.addToQueue(curSongForSettings); }}>
              <>
                <Entypo style={{ marginEnd: '5%' }} name="add-to-list" size={26} color="#959595" />
                <Text style={styles.modalText}>Add to queue</Text>
              </>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={'#000000'} style={[styles.button, { width: '100%', flexDirection: 'row', alignItems: 'center' }]} onPress={() => { songSettingsRef.current.close(); setTimeout(() => { songEditRef.current.present() }, 500) }}>
              <>
                <Feather style={{ marginEnd: '5%' }} name="edit" size={26} color="#959595" />
                <Text style={styles.modalText}>Edit song information</Text>
              </>
            </TouchableHighlight>
            <TouchableHighlight underlayColor={'#000000'} style={[styles.button, { width: '100%', flexDirection: 'row', alignItems: 'center' }]} onPress={() => { songSettingsRef.current?.close(); deleteRows(curSongForSettings); }}>
              <>
                <Feather style={{ marginEnd: '5%' }} name="minus-circle" size={26} color="#959595" />
                <Text style={styles.modalText}>Remove</Text>
              </>
            </TouchableHighlight>
            {/* <TouchableHighlight underlayColor={'#000000'} style={[styles.button, { width: '100%', flexDirection: 'row' }]} onPress={() => songSettingsRef.current?.close()}>
              <Text style={styles.modalText}>Close</Text>
            </TouchableHighlight> */}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={songEditRef}
        snapPoints={editSnapPoints}
        index={0}
        key={'EditSongInfo'}
        name={'EditSongInfo'}
        enableDismissOnClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1c1c1c', }}
        handleIndicatorStyle={{ backgroundColor: '#777777', width: 50 }}
        handleComponent={() => (
          <View style={{ height: 0 }} />
        )}
      >
        <EditInfo ref={songEditRef} song={curSongForSettings} />
      </BottomSheetModal>
    </SafeAreaView >
  );
}

export default Songs;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '5%',
    paddingHorizontal: '5%',
    width: '100%',
  },
  graadientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '17.5%',
    height: 10,
    zIndex: 2
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    backgroundColor: '#222222',
    borderRadius: 20,
    paddingTop: '3%',
    alignItems: 'left',
    height: '50%',
    width: '100%',
    opacity: 1,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  buttonColor: {
    shadowColor: '#17b6ff'
  },
  textBoldStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'left',
    color: 'white',
  },
  add: {
    height: 45,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: .5,
    shadowOffset: [0, 0],
    backgroundColor: '#17b6ff',
    shadowColor: '#17b6ff',
    borderRadius: 45,
    marginStart: '0%'
  },
  touchableRow: {
    marginHorizontal: 5,
    padding: 10,
    shadowOpacity: .5,
    shadowOffset: [0, 0],
    backgroundColor: '#000000',
    shadowColor: '#000000'
  },
});
