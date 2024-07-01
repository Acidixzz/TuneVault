import React, { useEffect, useState } from 'react';
import { Modal, Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, FlatList, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import SongComponent from './components/SongComponent';
import { Ionicons, createIconSetFromFontello } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import AudioHandler from './AudioHandler';
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';


export default function Songs() {
  const db = SQLite.openDatabaseSync('TuneVault.db');
  const [ah, setAh] = useState(null);
  const [songs, setSongs] = useState([]);

  //variable to show the elipsis window for each song
  const [songSettingsVisible, setSongSettingsVisible] = useState(false);
  //current item for setting popup
  const [curSongForSettings, setCurSongForSettings] = useState(null);

  useEffect(() => {

    db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync('CREATE TABLE IF NOT EXISTS songs (SONG_GU TEXT PRIMARY KEY, NAME TEXT NOT NULL, ARTIST TEXT, FILE_PATH TEXT NOT NULL, PICTURE BLOB, DATE_ADDED TEXT NOT NULL)');
    });

    db.withExclusiveTransactionAsync(async (txn) => {
      const SELECT = await txn.getAllAsync('SELECT * FROM songs');
      setSongs(SELECT);
      //console.log(query);
      setAh(new AudioHandler(SELECT));
    });
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
        await FileSystem.deleteAsync(FileSystem.documentDirectory + guid + name);

        const SELECT = await txn.getAllAsync('SELECT * FROM songs');
        setSongs(SELECT);
      });
      setSongSettingsVisible(false);
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
    // Alert.alert(
    //   'Settings',
    //   `for ${song.NAME}`,
    //   [
    //     { text: 'Close', onPress: () => console.log('closed'), style: 'cancel' },
    //     { text: 'Add to queue', onPress: () => console.log(song.ARTIST) },
    //     { text: 'Delete', onPress: () => deleteRows(song.SONG_GU) },
    //   ],
    //   { cancelable: false }
    // ); JUST IN CASE WE NEED ALERT
    try {
      setCurSongForSettings(song);
      setSongSettingsVisible(true);
    } catch (error) {
      console.log("Error loading modal window: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#171717' }}>

      <View style={{ justifyContent: 'center', alignItems: 'center', marginEnd: 'auto', marginStart: 'auto' }}>
        <TouchableOpacity onPress={pickMultipleSongs} style={styles.touchable}>
          <Text style={styles.textStyle}>Pick Multiple Songs</Text>
        </TouchableOpacity>

        <View style={{ margin: 20, flexDirection: 'row' }}>
          {/*play, pause, next, prev*/}
          <TouchableOpacity style={styles.touchableRow} onPress={ah?.play}>
            <Text style={styles.textStyle}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableRow} onPress={ah?.pause}>
            <Text style={styles.textStyle}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableRow} onPress={() => { ah?.playNext(songs) }}>
            <Text style={styles.textStyle}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableRow} onPress={() => { ah?.playPrev(songs) }}>
            <Text style={styles.textStyle}>Prev</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList style={{ marginTop: 20, width: '100%' }}
        showsVerticalScrollIndicator={true}
        data={songs}
        renderItem={({ item, index }) => (
          <View key={index}>
            <Modal animationType='slide' transparent={true} visible={songSettingsVisible}>
              <View>
                <TouchableOpacity style={{ height: '50%' }} onPress={() => setSongSettingsVisible(!songSettingsVisible)} />
                <View style={styles.modalView}>
                  <SongComponent item={curSongForSettings}></SongComponent>
                  <View style={{ borderBottomColor: '#666666', borderBottomWidth: .25, width: 400, marginTop: '3.05%' }}></View>
                  <TouchableOpacity style={[styles.button, styles.buttonColor]} onPress={() => deleteRows(curSongForSettings?.NAME, curSongForSettings?.SONG_GU)}>
                    <Text style={styles.textStyle}>Remove</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.buttonColor]} onPress={() => setSongSettingsVisible(!songSettingsVisible)}>
                    <Text style={styles.textStyle}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={{ flexDirection: 'row' }}>
              <SongComponent item={item} ah={ah} songs={songs} showEllipsis={true} settingFunc={settingsPopup} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    height: '50%',
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
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  touchable: {
    padding: 10,
    shadowOpacity: .5,
    shadowOffset: [0, 0],
    backgroundColor: '#17b6ff',
    shadowColor: '#17b6ff'
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
