import AsyncStorage from "@react-native-async-storage/async-storage";

export const loadData = async () => {
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
      return data;
    } catch (error) {
      console.log("Error loading data", error);
    }
}

export const storeData = async (files) => {
    try {

      data = await loadData();

      if (files.assets != null){
        toBeStored = [];
        for (const file of files.assets) {
          if (data.some(obj => obj.name === file.name && obj.size === file.size)){
            continue;
          }
          toBeStored.push(file)
          console.log(file.name, "Has been added to the store queue!");
        }
        data = data.concat(toBeStored);
        await AsyncStorage.setItem("songs", JSON.stringify(data));
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