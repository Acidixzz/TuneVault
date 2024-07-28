import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import SongComponent from './components/SongComponent';
import { Ionicons, createIconSetFromFontello, MaterialIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { Context } from '../ContextProvider';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { ScrollView } from 'react-native-gesture-handler';


export default function Songs() {
  const db = SQLite.openDatabaseSync('TuneVault.db');
  const { ah, sh } = useContext(Context);
  const [songs, setSongs] = useState([]);

  const scrollRef = useRef(null);

  //variable to show the elipsis bottomsheet
  const songSettingsRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.8}{...props} />,
    []
  );

  //current item for setting popup
  const [curSongForSettings, setCurSongForSettings] = useState(null);

  useEffect(() => {

    const fetchSongs = async () => {
      await db.withExclusiveTransactionAsync(async (txn) => {
        await txn.execAsync('CREATE TABLE IF NOT EXISTS songs (SONG_GU TEXT PRIMARY KEY, NAME TEXT NOT NULL, ARTIST TEXT, FILE_PATH TEXT NOT NULL, PICTURE BLOB, DATE_ADDED TEXT NOT NULL)');
      });

      await db.withExclusiveTransactionAsync(async (txn) => {
        const SELECT = await txn.getAllAsync('SELECT * FROM songs');
        setSongs(SELECT);
        //console.log(query);
        ah.songs = SELECT;
      });
    }
    fetchSongs();
  }, []);

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
        let query = 'INSERT INTO songs (SONG_GU, NAME, ARTIST, FILE_PATH, DATE_ADDED) VALUES ';
        let index = 0
        for (const file of files.assets) {
          query += `(${Array(5).fill('?').join(', ')})`;
          if (index < files.assets.length - 1) {
            query += ', ';
          }
          let gu = generateRandomGUID();
          await FileSystem.copyAsync({ from: file.uri, to: FileSystem.documentDirectory + gu + file.name });
          values.push(...[gu, file.name, 'Juice WRLD', FileSystem.documentDirectory + gu + file.name, new Date().toISOString()]);
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

  const deleteRows = async (name, guid) => {
    try {
      db.withExclusiveTransactionAsync(async (txn) => {
        await txn.runAsync('DELETE FROM songs WHERE SONG_GU == ?', guid);
        await ah.reset();
        await FileSystem.deleteAsync(FileSystem.documentDirectory + guid + name);

        const SELECT = await txn.getAllAsync('SELECT * FROM songs');
        setSongs(SELECT);
        console.log(SELECT);
        if (SELECT) {
          ah.setCurNextPrev(SELECT[0], SELECT);
        }
      });
    } catch (error) {
      console.log("Error deleting a song: ", error);
    }
  }

  function generateRandomGUID() {
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

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#131313', }}>


      <View style={styles.headerContainer}>
        <Text style={{ ...styles.textStyle, fontSize: 40, textAlign: 'center', }}>Songs</Text>

        <TouchableOpacity onPress={pickMultipleSongs} style={styles.add}>
          <MaterialIcons name="add" size={36} color="black" />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={['#0e0e0e', '#12121200']} style={styles.graadientBackground} />
      <ScrollView style={{ width: '100%', maxHeight: '100%' }} ref={scrollRef}>
        {songs.map((item, index) => (
          <View key={index}>
            <View style={[{ flexDirection: 'row', marginTop: index == 0 ? '2%' : 0 }]}>
              <SongComponent ref={scrollRef} item={item} songs={songs} showEllipsis={true} settingFunc={settingsPopup} />
            </View>
            {index === songs.length - 1 && (<View style={{ height: 125 }} />)}
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
        <BottomSheetScrollView style={{ backgroundColor: '#222222' }}>
          <View style={{ flex: 1, marginTop: '1%' }}>
            <SongComponent item={curSongForSettings} ref={songSettingsRef}></SongComponent>
            <View style={{ borderBottomColor: '#666666', borderBottomWidth: 1, width: 400, marginTop: '3.15%' }}></View>
            <TouchableOpacity style={[styles.button, { width: '100%' }]} onPress={() => { songSettingsRef.current?.close(); ah.addToQueue(curSongForSettings); }}>
              <Text style={styles.modalText}>Add to queue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { width: '100%' }]} onPress={() => { songSettingsRef.current?.close(); deleteRows(curSongForSettings?.NAME, curSongForSettings?.SONG_GU); }}>
              <Text style={styles.modalText}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { width: '100%' }]} onPress={() => songSettingsRef.current?.close()}>
              <Text style={styles.modalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView >
  );
}

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
    margin: 5,
    borderRadius: 20,
    padding: 10,
    width: 150,
  },
  buttonColor: {
    shadowColor: '#17b6ff'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    textAlign: 'center',
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
