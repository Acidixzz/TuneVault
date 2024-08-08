//<Imports>

//React
import React, { createContext, useRef } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createNotifications, ZoomInDownZoomOutDown, FadeInFadeOut, AnimationBuilder, useNotificationController } from 'react-native-notificated';
import { interpolate } from 'react-native-reanimated';
import { Buffer } from 'buffer';
import { kmeans } from 'ml-kmeans';
import * as math from 'mathjs';
import { decode } from 'base64-arraybuffer';


//Expo
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

//Internal
import AudioHandler from './AudioHandler';
import SettingsHandler from './SettingsHandler';

//</Imports>

// Create a Context
const Context = createContext();

export const { NotificationsProvider, notify, ...events } = createNotifications({
  animationConfig: {
    animationConfigIn: ZoomInDownZoomOutDown,
    animationConfigOut: FadeInFadeOut,
    transitionInStyles: (progress) => {
      'worklet'
      const translateY = interpolate(progress.value, [0, 1], [-100, 0])
      return {
        opacity: progress.value,
        transform: [{ translateY }],
      }
    },
    transitionOutStyles: (progress) => {
      'worklet'
      const translateY = interpolate(progress.value, [0, 1], [100, 0])
      return {
        opacity: progress.value,
        transform: [{ translateX: translateY }],
      }
    },
  },
  notificationPosition: 'bottom',
  notificationWidth: 800,
  duration: 1500,
  variants: {
    queue: {
      component: ({ bottom, text }) => {
        const { remove } = useNotificationController();

        return (
          <TouchableOpacity activeOpacity={1} style={{ height: 50, width: '100%', borderRadius: 10, backgroundColor: 'white', bottom: bottom, justifyContent: 'center', zIndex: 0 }} onPress={() => { remove() }}>
            <Text style={{ color: 'black', textAlign: 'left', textAlignVertical: 'center', marginStart: 20 }}>{text}</Text>
          </TouchableOpacity>
        )
      },
    }
  },
});

// Create a Provider Component
const ContextProvider = ({ children }) => {
  const ah = useRef(new AudioHandler());
  const sh = useRef(new SettingsHandler());

  return (
    <Context.Provider value={{ ah: ah.current, sh: sh.current }}>
      {children}
    </Context.Provider>
  );
};

export { Context, ContextProvider };