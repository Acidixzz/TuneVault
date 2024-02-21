import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as DocumentPicker from "expo-document-picker";
import {storeData, clearStorage} from "./Storage";


export default function App() {
  
  const pickMultipleDocuments = async () => {
    try {
      const results = await DocumentPicker.getDocumentAsync({
        multiple : true,
        type : "audio/*"
      });

      console.log(results);

      storeData(results);

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
      <TouchableOpacity onPress={pickMultipleDocuments} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#17b6ff', shadowColor : '#17b6ff'}}>
        <Text style= {{color : '#ffffff'}}>Pick Multiple Documents</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearStorage} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#c21d1d', shadowColor : '#c21d1d', marginTop: 10}}>
        <Text style= {{color : '#ffffff'}}>Clear Storage</Text>
      </TouchableOpacity>
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
});
