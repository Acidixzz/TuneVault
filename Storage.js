import AsyncStorage from "@react-native-async-storage/async-storage";
import AudioHandler from "./AudioHandler";

export default class Storage {
  
  constructor() {
    try {

      this.AudioHandler = new AudioHandler();
      this.songs = this.loadSongs();
      

    } catch (error) {
      console.log("Eror Initializing Storage:", error);
    }
  }

  loadSongs = async () => {
    try {
      const stringData = await AsyncStorage.getItem("songs");
      let data = JSON.parse(stringData);
      console.log(data);
      if (data != null) { 
        console.log("Previously Stored Data :", data.map(obj => obj.name));
      }
      else {
        data = []; 
        //data is null instead of [] and in the store method and others, I use array properties in conditions
      }

      this.songs = data;
      this.AudioHandler.songList = await this.AudioHandler.createSongObjectsFromMetaData(data);
      this.AudioHandler.curSong = this.AudioHandler.songList[this.AudioHandler.curIndex]; //clean this up with a AH async init method?
      
      return data;
      
    } catch (error) {
      console.log("Error loading data", error);
    }
  }

  storeSongs = async (files) => {
    try {

      data = await this.loadSongs();

      if (files.assets != null){
        toBeStored = [];
        for (const file of files.assets) {
          if (data.some(obj => obj.name === file.name && obj.size === file.size)){
            continue;
          }
          toBeStored.push(file);
          console.log(file.name, "Has been added to the store queue!");
        }
        data = data.concat(toBeStored);
        this.songs = data;
        await AsyncStorage.setItem("songs", JSON.stringify(data));
      }
    } catch (error) {
      console.log("Error storing files", error);
    }
  }
    
  clearStorage = async () => {
    try {
        this.songs = [];
        await AsyncStorage.clear();
        console.log("Storage has been cleared.");
    } catch (error) {
        console.log("Error clearing storage:", error);
    }
  }
}
