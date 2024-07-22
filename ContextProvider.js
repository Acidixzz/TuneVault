import React, { createContext, useRef } from 'react';
import AudioHandler from './AudioHandler';
import SettingsHandler from './SettingsHandler';

// Create a Context
const Context = createContext();

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
