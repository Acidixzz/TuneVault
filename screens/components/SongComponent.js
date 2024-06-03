import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const SongComponent = ({item, ah, songs}) => {
  //console.log(item);
  return (
    <Pressable width="90%" onPress={() => {ah.setCurNextPrev(item, songs)}}>
      <View style= {{flexDirection: 'row', marginTop: 5}}>

        <View style= {{height: 50, width: 50, backgroundColor: 'black'}}>
          {/* Thumbnail image goes here */}
        </View>

        <View style= {{start: "25%", flexDirection: 'column'}}>
          <Text style= {{fontSize: 20}}>{item?.NAME}</Text>
          <Text style= {{marginTop: 5}}>{item?.ARTIST}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default SongComponent

const styles = StyleSheet.create({})