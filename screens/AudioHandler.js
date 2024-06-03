import { Audio } from "expo-av";

export default class AudioHandler {

    constructor () {
        try {
            Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
            this.cur = null;
            this.prev = null;
            this.next = null;

            //this will be the row data for prev and next
            this.prevRow = null;
            this.curRow = null;
            this.nextRow = null;
        } catch (error) {
            console.log("Error initializing AudioHandler: ", error);
        }
    }

    play = async () => {
        try {
            await this.cur.playAsync();
        } catch (error) {
            console.log("Error playing song: ", error);
        }
    }

    pause = async () => {
        try {
            await this.cur.pauseAsync();
        } catch (error) {
            console.log("Error pausing song: ", error);
        }
    }

    playPrev = async (songs) => {
        try {
            await this.cur.stopAsync();
            this.next = this.cur;
            this.cur = this.prev;

            this.nextRow = this.curRow;
            this.curRow = this.prevRow;

            await this.cur.playAsync();

            let curIndex = await songs.findIndex(item => item.SONG_GU === this.curRow.SONG_GU);
            this.prevRow = await songs[curIndex > 0 ? curIndex-1 : songs.length-1];

            const {sound: prevSong} = await Audio.Sound.createAsync(
                { uri: this.prevRow.FILE_PATH },
                { shouldPlay: false }
            );
            this.prev = prevSong;
        } catch (error) {
            console.log("Error when clicking prev: ", error);
        }
    }

    playNext = async (songs) => {
        try {
            await this.cur.stopAsync();
            this.prev = this.cur;
            this.cur = this.next;

            this.prevRow = this.curRow;
            this.curRow = this.nextRow;

            await this.cur.playAsync();

            let curIndex = await songs.findIndex(item => item.SONG_GU === this.curRow.SONG_GU);
            this.nextRow = await songs[curIndex < songs.length-1 ? curIndex+1 : 0];

            const {sound: nextSong} = await Audio.Sound.createAsync(
                { uri: this.nextRow.FILE_PATH },
                { shouldPlay: false }
            );
            this.next = nextSong;
        } catch (error) {
            console.log("Error when clicking next: ", error);
        }
    }

    setCurNextPrev = async (cur, songs) => {
        try {
            if (this.cur && this.curRow === cur){
                return;
            }
            if (this.cur){
                await this.cur.stopAsync();
            }
            let curIndex = await songs.findIndex(item => item.SONG_GU === cur.SONG_GU);
            this.prevRow = await songs[curIndex > 0 ? curIndex-1 : songs.length-1];
            this.curRow = cur;
            this.nextRow = await songs[curIndex < songs.length-1 ? curIndex+1 : 0];

            const {sound: curSong} = await Audio.Sound.createAsync(
                { uri: cur.FILE_PATH },
                { shouldPlay: false }
            );
            this.cur = curSong;
            
            const {sound: prevSong} = await Audio.Sound.createAsync(
                { uri: this.prevRow.FILE_PATH },
                { shouldPlay: false }
            );
            this.prev = prevSong;

            const {sound: nextSong} = await Audio.Sound.createAsync(
                { uri: this.nextRow.FILE_PATH },
                { shouldPlay: false }
            );
            this.next = nextSong;

            await this.cur.playAsync();
        } catch (error) {
            console.log("Error setting cur, next, and prev: ", error);
        }
    }
}