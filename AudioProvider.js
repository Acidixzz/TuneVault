import React, { createContext, useRef } from 'react';
import AudioHandler from './screens/AudioHandler';

// Create a Context
const AudioContext = createContext();

// Create a Provider Component
const AudioProvider = ({ children }) => {
  const ah = useRef(new AudioHandler());

  return (
    <AudioContext.Provider value={ah.current}>
      {children}
    </AudioContext.Provider>
  );
};

export { AudioContext, AudioProvider };
