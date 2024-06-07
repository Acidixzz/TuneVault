import React, { useEffect, useState } from 'react';
import { Modal, Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, FlatList, FlatListComponent, VirtualizedList } from 'react-native';
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import SongComponent from './components/SongComponent';
import { Ionicons, createIconSetFromFontello } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import AudioHandler from './AudioHandler';

export default function Songs() {
  const db = SQLite.openDatabaseSync('TuneVault.db');
  const [ah, setAh] = useState(null);
  const [songs, setSongs] = useState([]);

  //variable to show the elipsis window for each song
  const [songSettingsVisible, setSongSettingsVisible] = useState(false);
  //current item for setting popup
  const [curSongForSettings, setCurSongForSettings] = useState(null);

  useEffect(() => {
    db.withExclusiveTransactionAsync(async (txn) =>{
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

      if (status !== "granted"){
        alert("Permission to access audio files denied!");
        return;
      }

      const results = await DocumentPicker.getDocumentAsync({
        multiple : true,
        type : "audio/*",
        copyToCacheDirectory : false
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
        for (const file of files.assets){
          query+= `(${Array(5).fill('?').join(', ')})`;
          if (index < files.assets.length - 1){
            query+= ', ';
          }
          values.push(...[generateRandomGUID(), file.name, 'Juice WRLD', file.uri, new Date().toISOString()]);
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

  const deleteRows = async (guid) => {
    try {
      db.withExclusiveTransactionAsync(async (txn) => {
        await txn.runAsync('DELETE FROM songs WHERE SONG_GU == ?', guid);

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
    <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 100 }}>
      
      <View style={{justifyContent: 'center', alignItems: 'center', marginEnd: 'auto', marginStart: 'auto'}}>
        <TouchableOpacity onPress={pickMultipleSongs} style={styles.touchable}>
          <Text style={styles.textStyle}>Pick Multiple Songs</Text> 
        </TouchableOpacity>

        <View style={{ margin:20, flexDirection: 'row' }}>
          {/*play, pause, next, prev*/}
          <TouchableOpacity style={styles.touchableRow} onPress={ah?.play}>
            <Text style={styles.textStyle}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableRow} onPress={ah?.pause}>
            <Text style={styles.textStyle}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableRow} onPress={() => {ah?.playNext(songs)}}>
            <Text style={styles.textStyle}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableRow} onPress={() => {ah?.playPrev(songs)}}>
            <Text style={styles.textStyle}>Prev</Text>
          </TouchableOpacity>
        </View>  
      </View>
            
      <FlatList style= {{start: '5%', marginTop: 20, width: '90%'}}
        showsVerticalScrollIndicator={true}
        data={songs} 
        renderItem={({item}) => (
          <View>
            <Modal animationType='slide' transparent={true} visible={songSettingsVisible}>
              <View style={styles.centeredView}>
                <View style={[styles.modalView]}>
                  <Text style={styles.modalText}>Settings for {curSongForSettings?.NAME}</Text>
                  <Pressable style={[styles.button, styles.buttonColor]} onPress={() => deleteRows(curSongForSettings?.SONG_GU)}>
                    <Text style={styles.textStyle}>Remove</Text>
                  </Pressable>
                  <Pressable style={[styles.button, styles.buttonColor]} onPress={() => setSongSettingsVisible(!songSettingsVisible)}>
                    <Text style={styles.textStyle}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            <View flexDirection='row'>
              <SongComponent item={item} ah={ah} songs={songs}/>
              <Pressable onPress={() => {settingsPopup(item)}}>
                <Ionicons style={{marginTop: 18}} name="ellipsis-horizontal-sharp" size={24} color="black" />
              </Pressable>
            </View>
            <View style= {{height: 1, width: '100%', backgroundColor: '#808080', marginTop: 5}}/>
          </View>
        )}
        /> 
    </View>
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
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    margin: 5,
    borderRadius: 20,
    padding: 10,
    width: 150,
    elevation: 2,
    shadowOpacity: .75,
    shadowOffset: [0,0],
  },
  buttonColor: {
    backgroundColor: '#2196F3',
    shadowColor : '#17b6ff'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  touchable: {
    padding: 10,
    shadowOpacity: .5, 
    shadowOffset: [0,0], 
    backgroundColor: '#17b6ff', 
    shadowColor : '#17b6ff'
  },

  touchableRow: {
    marginHorizontal: 5,
    padding: 10,
    shadowOpacity: .5, 
    shadowOffset: [0,0], 
    backgroundColor: '#000000', 
    shadowColor : '#000000'
  },
});
