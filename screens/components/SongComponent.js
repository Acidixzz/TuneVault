//<Imports>

//React
import React, { useState, useContext, forwardRef, useEffect, useRef, } from 'react';
import { Dimensions, Easing, Pressable, StyleSheet, Text, View, TouchableOpacity, TouchableHighlight, Image, Animated } from 'react-native';
import { PanGestureHandler, Swipeable, } from 'react-native-gesture-handler';
import { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

//Expo
import { Ionicons, createIconSetFromFontello, Entypo, FontAwesome5 } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';

//Internal
import { Context } from '../../util/ContextProvider';
import emitter from '../../util/EventEmitter';

//</Imports>


const SongComponent = forwardRef((props, ref) => {

  const db = SQLite.openDatabaseSync('TuneVault.db');

  const [isSettingsPressed, setIsSettingsPressed] = useState(false);
  const { ah, sh } = useContext(Context);

  const { item, songs, showEllipsis = false, settingFunc = null, toastHandler, shuffle } = props;

  const swipeRef = useRef(null);
  const [background, setBackground] = useState(false);

  const height = useRef(new Animated.Value(70)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    emitter.addListener(`delete_${item.SONG_GU}`, deleteAnim);

    return () => { emitter.removeListener(`delete_${item.SONG_GU}`, deleteAnim) }
  }, []);

  const playSongs = async (shuffle) => {
    await db.withExclusiveTransactionAsync(async (txn) => {
      let SELECT = [];
      if (shuffle && ah?.curRow !== item) {
        SELECT = await txn.getAllAsync(`SELECT * FROM songs ORDER BY RANDOM();`);
        console.log(SELECT.map(item => item.NAME));
      } else {
        SELECT = songs;
      }

      ah.setCurNextPrev(item, SELECT, false);
    });
    sh.listeners.forEach((item) => item.shuffle?.(shuffle));
  }

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

  const deleteAnim = () => {
    Animated.timing(
      height, {
      toValue: 0,
      duration: 250,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
    Animated.timing(
      opacity, {
      toValue: 0,
      duration: 250,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
  }

  return (
    <Animated.View style={[styles.pressable, { height: height, opacity: opacity }]}>
      <Swipeable
        ref={swipeRef}
        renderLeftActions={left}
        simultaneousHandlers={ref}
        overshootLeft={false}
        leftThreshold={100}
        onSwipeableWillOpen={(direction) => {
          if (direction === 'left') {
            ah.addToQueue(item);
            toastHandler('Added to Queue');
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
        <TouchableHighlight activeOpacity={0.5} underlayColor={'#000000'} disabled={!showEllipsis} style={[styles.pressable, { backgroundColor: '#17171700', }]} onPress={() => { ah ? playSongs(shuffle) : console.log('ah not loaded'); }} >
          <View style={{ flexDirection: 'row', backgroundColor: showEllipsis ? '#121212' : '#12121200' }}>
            <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center', height: 70 }}>
              {/* Thumbnail image goes here */}
              {!!item.PICTURE ?
                (<Image source={{ uri: `data:image/png;base64,${item.PICTURE}` }} style={{ flex: 1, width: 50, maxHeight: 50 }} />)
                :
                (<View style={{ flex: 1, maxHeight: 50, width: 50, backgroundColor: 'white', }} />)}
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
    </Animated.View>
  );
});

export default SongComponent

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
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
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
  }
})