import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { Ionicons, createIconSetFromFontello } from '@expo/vector-icons';

const SongComponent = ({ item, ah, songs, showEllipsis = false, settingFunc = null }) => {
  //console.log(item);
  const [isPressed, setIsPressed] = useState(false);
  const [isSettingsPressed, setIsSettingsPressed] = useState(false);


  return (
    <Pressable disabled={!showEllipsis} onPressIn={() => { setIsPressed(true) }} onPressOut={() => { setIsPressed(false) }} style={[styles.pressable, { backgroundColor: isPressed ? '#00000099' : '#17171700', }]} onPress={() => { ah ? ah.setCurNextPrev(item, songs) : console.log('in setting') }}>
      <View style={{ flexDirection: 'row' }}>

        <View style={{ height: 50, width: 50, backgroundColor: 'white' }}>
          {/* Thumbnail image goes here */}
        </View>

        <View style={{ start: "25%", flexDirection: 'column', width: '73%' }}>
          <Text style={{ fontSize: 20, color: 'white' }}>{item?.NAME}</Text>
          <Text style={{ marginTop: 5, color: 'gray' }}>{item?.ARTIST}</Text>
        </View>

        {showEllipsis && (
          <Pressable onPress={() => { settingFunc(item) }} onPressIn={() => { setIsSettingsPressed(true) }} onPressOut={() => { setIsSettingsPressed(false) }}>
            <Ionicons style={{ marginTop: '50%' }} name="ellipsis-horizontal-sharp" size={24} color={isSettingsPressed ? '#404040' : '#989898'} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default SongComponent

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    paddingVertical: '3%',
    paddingStart: '5%'
  },
})