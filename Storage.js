import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

export const loadData = async () => {
    try {
      const data = [];
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length != 0) { 
        for (const key of keys) {
          const val = await AsyncStorage.getItem(key);
          data.push(JSON.parse(val)); 
        }
        console.log("Previously Stored Data :", data.map(obj => obj.name));
      }
      return data;
    } catch (error) {
      console.log("Error loading data", error);
    }
}

export const storeData = async (files) => {
    try {

      data = await loadData();

      if (files.assets != null){
        for (const file of files.assets) {
          if (data.some(obj => obj.name === file.name && obj.size === file.size)){
            continue;
          }
          const guid = uuidv4();
          console.log(guid);
          await AsyncStorage.setItem(guid, JSON.stringify(file));
        }
      }
    } catch (error) {
      console.log("Error storing files", error);
    }
}
  
export const clearStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log("Storage has been cleared.");
    } catch (error) {
        console.log("Error clearing storage:", error);
    }
}