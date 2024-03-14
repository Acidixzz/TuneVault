import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-ico-material-design';
import * as DocumentPicker from "expo-document-picker";
import Storage from "./Storage";
import * as MediaLibrary from "expo-media-library";
import { Library, Songs, Settings } from './screens';

iconWidth = 26;
iconHeight = 26;

export default function App() {

  //const AH = new AudioHandler();
  const DB = new Storage();
  
  //function for permissions

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

      // Handle the selected documents
    } catch (error) {
      if (results.canceled == true) {
        console.log('Document picking cancelled');
      } else {
        console.error('Error picking documents:', error);
      }
    }
  };



  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={pickMultipleSongs} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#17b6ff', shadowColor : '#17b6ff'}}>
        <Text style= {{color : '#ffffff'}}>Pick Multiple Songs</Text> 
      </TouchableOpacity>
      <TouchableOpacity onPress={DB.clearStorage} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#c21d1d', shadowColor : '#c21d1d', marginTop: 10}}>
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
      </View>

      <View style={styles.NavContainer}>
        <View style={styles.NavBar}>
          <Pressable onPress={() => console.log("first")} style={styles.IconBehave}>
            <Icon name='bookmark-ribbon' height={iconHeight} width={iconWidth} color='#000000'/>
          </Pressable>

          <Pressable onPress={() => console.log("second")} style={styles.IconBehave}>
            <Icon name='add-plus-button' height={iconHeight} width={iconWidth} color='#000000'/>
          </Pressable>


          <Pressable onPress={() => console.log("third")} style={styles.IconBehave}>
            <Icon name='settings-cogwheel-button' height={iconHeight} width={iconWidth} color='#000000'/>
          </Pressable>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  NavContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
  },

  NavBar: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    width: '100%',
    justifyContent: 'space-evenly',
    height: 80,
  },

  IconBehave: {
    padding: 20
  }
});
