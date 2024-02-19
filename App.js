import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as DocumentPicker from "expo-document-picker";

export default function App() {
  
  const pickMultipleDocuments = async () => {
    try {
      const results = await DocumentPicker.getDocumentAsync({
        multiple : true,
        type : "audio/*"
      });

      console.log(results);

      // Handle the selected documents
    } catch (error) {
      if (results['canceled'] == true) {
        console.log('Document picking cancelled');
      } else {
        console.error('Error picking documents:', error);
      }
    }
  };
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={pickMultipleDocuments} style={{padding: 10, shadowOpacity: .5, shadowOffset: [0,0], backgroundColor: '#dbdbd3'}}>
        <Text>Pick Multiple Documents</Text>
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
