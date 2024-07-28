import { Dimensions, Easing, Pressable, StyleSheet, Text, View, TouchableOpacity, TouchableHighlight } from 'react-native';
import React, { useState, useContext, forwardRef, useEffect, useRef } from 'react';
import { Ionicons, createIconSetFromFontello, Entypo, FontAwesome5 } from '@expo/vector-icons';
import { Context } from '../../ContextProvider';
import { PanGestureHandler, Swipeable, } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


const SongComponent = forwardRef((props, ref) => {
  //console.log(item);
  const [isPressed, setIsPressed] = useState(false);
  const [isSettingsPressed, setIsSettingsPressed] = useState(false);
  const { ah, sh } = useContext(Context);

  const { item, songs, showEllipsis = false, settingFunc = null, } = props;
  const swipeRef = useRef(null);
  const [background, setBackground] = useState(false);

  const left = (progress, dragX) => {


    return (
      <Animated.View style={[styles.addQueue]}>
        {background ?
          (<FontAwesome5 name="check-circle" size={35} color="white" />)
          :
          (<Entypo name="add-to-list" size={35} color="white" />)
        }
      </Animated.View>
    )
  }


  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={left}
      simultaneousHandlers={ref}
      overshootLeft={false}
      leftThreshold={100}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') {
          ah.addToQueue(item);
          setTimeout(() => {
            setBackground(true);
            swipeRef.current.close();
          }, 25)
        }
      }
      }
      onSwipeableClose={() => setBackground(false)}
      dragOffsetFromLeftEdge={30}
    >
      <TouchableHighlight activeOpacity={0.5} underlayColor={'#000000'} disabled={!showEllipsis} style={[styles.pressable, { backgroundColor: '#17171700', }]} onPress={() => { ah ? ah.setCurNextPrev(item, songs) : console.log('ah not loaded') }} >
        <View style={{ flexDirection: 'row', backgroundColor: showEllipsis ? '#121212' : '#12121200' }}>
          <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center', height: 70 }}>
            <View style={{ height: 50, width: 50, backgroundColor: 'white', }} />
            {/* Thumbnail image goes here */}
          </View>

          <View style={{ flexDirection: 'column', width: '65%', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, color: 'white' }}>{item?.NAME}</Text>
            <Text style={{ marginTop: 5, color: 'gray' }}>{item?.ARTIST}</Text>
          </View>

          {showEllipsis && (
            <TouchableOpacity style={[styles.ellipsis]} onPress={() => { settingFunc(item) }} onPressIn={() => { setIsSettingsPressed(true) }} onPressOut={() => { setIsSettingsPressed(false) }}>
              <Ionicons style={{}} name="ellipsis-horizontal-sharp" size={24} color={isSettingsPressed ? '#404040' : '#989898'} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableHighlight>
    </Swipeable>
  );
});

export default SongComponent

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
  },
  addQueue: {
    height: 70,
    width: 100,
    backgroundColor: '#17b6ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ellipsis: {
    height: 70,
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
  }
})