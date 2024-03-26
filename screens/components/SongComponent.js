import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SongComponent = ({item}) => {
  //console.log(item);
  return (
    <Pressable>
      <Text>{item?.name}</Text>
    </Pressable>
  );
}

export default SongComponent

const styles = StyleSheet.create({})