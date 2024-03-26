import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, FlatList, FlatListComponent, VirtualizedList } from 'react-native';
import * as DocumentPicker from "expo-document-picker";
import Storage from "../Storage";
import * as MediaLibrary from "expo-media-library";
import SongComponent from './components/SongComponent';


export default function Songs() {

  const [allSongs,setAllSongs] = useState([]);
  const DB = new Storage();

  async function getAllSongs() {
    setAllSongs(await DB.loadSongs());
  }
  
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

      await DB.storeSongs(results);
      await getAllSongs();

      // Handle the selected documents
    } catch (error) {
      if (results.canceled == true) {
        console.log('Document picking cancelled');
      } else {
        console.error('Error picking documents:', error);
      }
    }
  };

  const clearSongs = async () => {
    await DB.clearStorage();
    await getAllSongs();
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
      
      <TouchableOpacity onPress={pickMultipleSongs} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#17b6ff', shadowColor : '#17b6ff'}}>
        <Text style= {{color : '#ffffff'}}>Pick Multiple Songs</Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={clearSongs} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#c21d1d', shadowColor : '#c21d1d', marginTop: 10}}>
        <Text style= {{color : '#ffffff'}}>Clear Storage</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={DB.AudioHandler.play} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#000000', shadowColor : '#000000', marginTop: 10, marginRight: 10}}>
          <Text style= {{color : '#ffffff'}}>Play Sound</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={DB.AudioHandler.pause} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#000000', shadowColor : '#000000', marginTop: 10, marginRight: 10}}>
          <Text style= {{color : '#ffffff'}}>Pause Sound</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={DB.AudioHandler.prev} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#000000', shadowColor : '#000000', marginTop: 10, marginRight: 10}}>
          <Text style= {{color : '#ffffff'}}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={DB.AudioHandler.next} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#000000', shadowColor : '#000000', marginTop: 10, marginRight: 10}}>
          <Text style= {{color : '#ffffff'}}>Next</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => {console.log(DB.AudioHandler.songList)}} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#000000', shadowColor : '#000000', marginTop: 10, marginRight: 10}}>
          <Text style= {{color : '#ffffff'}}>bruh</Text>
        </TouchableOpacity> */}
      </View>  

      {/* <TouchableOpacity onPress={() => {console.log(DB.AudioHandler.curSong)}} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#000000', shadowColor : '#000000', marginTop: 10, marginRight: 10}}>
          <Text style= {{color : '#ffffff'}}>song</Text>
        </TouchableOpacity> */}
            
      <FlatList
        showsVerticalScrollIndicator={false}
        data={allSongs} 
        renderItem={({item}) => (
          <SongComponent item={item}/>
        )}
        />

    </View>
  );
}
