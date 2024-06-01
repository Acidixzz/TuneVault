import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Pressable, FlatList, FlatListComponent, VirtualizedList } from 'react-native';
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import SongComponent from './components/SongComponent';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import {v5 as uuidv5} from 'uuid';

export default function Songs() {
  const db = SQLite.openDatabaseSync('TuneVault.db');
  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  
  useEffect(() => {
    db.withTransactionSync(async () =>{
      await db.execAsync('CREATE TABLE IF NOT EXISTS songs (SONG_GU TEXT PRIMARY KEY, NAME TEXT NOT NULL, ARTIST TEXT, FILE_PATH TEXT NOT NULL, PICTURE BLOB, DATE_ADDED TEXT NOT NULL)');
    });
    
    db.withTransactionSync(async() => {
      const SELECT = await db.getAllAsync('SELECT * FROM songs');
      setSongs(SELECT);
      //console.log(query);

      
    });

    setIsLoading(false);
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

        db.withTransactionSync(async() => {
          console.log(db.runSync(query, values));

          const SELECT = await db.getAllAsync('SELECT * FROM songs');
          setSongs(SELECT);
        });
      }
    } catch (error) {
      console.error('Error inserting rows:', error);
    }
  }

  const deleteRows = async (guid) => {
    try {
      db.withTransactionSync(async() => {
        await db.runAsync('DELETE FROM songs WHERE SONG_GU == ?', guid);

        const SELECT = await db.getAllAsync('SELECT * FROM songs');
        setSongs(SELECT);
      });
    } catch (error) {
      
    }
  }

  function generateRandomGUID() {
    // Generate a random hexadecimal string (8 characters)
    const randomHex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
    const guid = `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
    return guid.toUpperCase(); // Convert to uppercase for consistency
  }

  const settingsPopup = (song) => {
    Alert.alert(
      'Confirmation',
      'Do you want to remove this song from your library?',
      [
        {
          text: 'No',
          onPress: () => console.log('No Pressed'),
          style: 'cancel',
        },
        { text: 'Yes', onPress: () => deleteRows(song.SONG_GU) },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 100 }}>
      
      <View style={{justifyContent: 'center', alignItems: 'center', marginEnd: 'auto', marginStart: 'auto'}}>
        <TouchableOpacity onPress={pickMultipleSongs} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#17b6ff', shadowColor : '#17b6ff'}}>
          <Text style= {{color : '#ffffff'}}>Pick Multiple Songs</Text> 
        </TouchableOpacity>

        <View style={{ flexDirection: 'row' }}>
          {/*play, pause, next, prev*/}
        </View>  
      </View>
            
      <FlatList style= {{start: '5%', marginTop: 20, width: '90%'}}
        showsVerticalScrollIndicator={true}
        data={songs} 
        renderItem={({item}) => (
          <View>
          <View flexDirection='row'>
            <SongComponent item={item}/>
            <Pressable onPress={() => {settingsPopup(item)}}>
              <Ionicons style={{marginTop: 18}} name="ellipsis-horizontal-sharp" size={24} color="black" />
            </Pressable>
          </View>
          <View style= {{height: 1, width: '100%', backgroundColor: '#808080', marginTop: 5}}/>
          </View>
        )}
        /> 
        {/* this is purely for reference as this syntax can be used to dynamically render what songs are loaded */}

    </View>
  );
}
