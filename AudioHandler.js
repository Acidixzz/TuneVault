import { Audio } from 'expo-av';

export default class AudioHandler {

    constructor() {
        try {
            
            this.songList = [];
            this.curIndex = 0;
            this.curSong = null;
            this.init();

        } catch (error) {
            console.log("Error Initializing AudioHandler:", error);
        }
    }

    init = async () => {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
    }

    getNewSongList = async (metaData) => {
        try {
            
            this.songList = await this.createSongObjectsFromMetaData(metaData);
            this.curIndex = 0;
            this.curSong = this.songList[this.curIndex];

        } catch (error) {
            console.log("Error getting new song list:", error);
        }
    }

    createSongObjectsFromMetaData = async (metaData) => {
        try {
            //eventually make it only create playbackObjects for songs not already in this.songList
            const songList = [];
            for (const song of metaData) {
                const {sound: playbackObject} = await Audio.Sound.createAsync(
                    { uri: song.uri },
                    { shouldPlay: false }
                );
                songList.push(playbackObject);
            }
            return songList;

        } catch (error) {
            console.log("Error Creating Song Objects From MetaData:", error);
        }
    }

    //take away the parameter eventually since we will just use the songList and cur index but keep for testing
    play = async () => { 
        try {
            
            await this.curSong.playAsync();

        } catch (error) {
            console.log("Error when playing song:", error);
        }
    }

    pause = async () => {
        try {
            
            await this.curSong.pauseAsync();

        } catch (error) {
            console.log("Error when pausing song:", error);
        }
    }

    next = async () => {
        try {
            
            await this.curSong.stopAsync();
            if (this.curIndex < this.songList.length-1) {
                this.curIndex++;
            }
            else {
                this.curIndex = 0;
            }
            this.curSong = this.songList[this.curIndex];
            await this.curSong.playAsync();

        } catch (error) {
            console.log("Error Skipping track and playing next:", error);
        }
    }

    prev = async () => {
        try {
            
            await this.curSong.stopAsync();
            if (this.curIndex > 0) {
                this.curIndex--;
            }
            else {
                this.curIndex = this.songList.length-1;
            }
            this.curSong = this.songList[this.curIndex];
            await this.curSong.playAsync();

        } catch (error) {
            console.log("Error going to prev track and playing it:", error);
        }
    }


}