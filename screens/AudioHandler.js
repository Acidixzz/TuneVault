import { Audio } from "expo-av";

export default class AudioHandler {

    constructor(songs) {
        try {
            const loadAudio = async () => {
                await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
            }
            loadAudio();
            this.songs = songs;

            this.cur = new Audio.Sound();
            this.prev = new Audio.Sound();
            this.next = new Audio.Sound();

            //this will be the row data for prev and next
            this.prevRow = null;
            this.curRow = null;
            this.nextRow = null;
        } catch (error) {
            console.log("Error initializing AudioHandler: ", error);
        }
    }

    playNextWhenDone = status => {
        if (status.didJustFinish) {
            this.playNext(this.songs);
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
            this.songs = songs;
            await this.next.unloadAsync();
            let temp = this.next;

            this.next = this.cur;
            this.cur = this.prev;

            this.nextRow = this.curRow;
            this.curRow = this.prevRow;

            this.cur.setOnPlaybackStatusUpdate(this.playNextWhenDone);
            await this.cur.playAsync();

            let curIndex = await songs.findIndex(item => item.SONG_GU === this.curRow.SONG_GU);
            this.prevRow = await songs[curIndex > 0 ? curIndex - 1 : songs.length - 1];

            this.prev = temp;
            await this.prev.loadAsync({ uri: this.prevRow.FILE_PATH }, { shouldPlay: false });
        } catch (error) {
            console.log("Error when clicking prev: ", error);
        }
    }

    playNext = async (songs) => {
        try {
            await this.cur.stopAsync();
            this.songs = songs;
            await this.prev.unloadAsync();
            let temp = this.prev;

            this.prev = this.cur;
            this.cur = this.next;

            this.prevRow = this.curRow;
            this.curRow = this.nextRow;

            this.cur.setOnPlaybackStatusUpdate(this.playNextWhenDone);
            await this.cur.playAsync();

            let curIndex = await songs.findIndex(item => item.SONG_GU === this.curRow.SONG_GU);
            this.nextRow = await songs[curIndex < songs.length - 1 ? curIndex + 1 : 0];

            this.next = temp;
            await this.next.loadAsync({ uri: this.nextRow.FILE_PATH }, { shouldPlay: false });
        } catch (error) {
            console.log("Error when clicking next: ", error);
        }
    }

    setCurNextPrev = async (cur, songs) => {
        try {
            if (this.cur._loaded && this.curRow === cur) {
                return;
            }
            else if (this.cur._loaded) {
                await this.cur.stopAsync();
                await this.cur.unloadAsync();
                if (this.next) {
                    await this.next.unloadAsync();
                }
                if (this.prev) {
                    await this.prev.unloadAsync();
                }
            }
            let curIndex = await songs.findIndex(item => item.SONG_GU === cur.SONG_GU);
            this.prevRow = await songs[curIndex > 0 ? curIndex - 1 : songs.length - 1];
            this.curRow = cur;
            this.nextRow = await songs[curIndex < songs.length - 1 ? curIndex + 1 : 0];

            await this.cur.loadAsync({ uri: cur.FILE_PATH }, { shouldPlay: false });
            await this.prev.loadAsync({ uri: this.prevRow.FILE_PATH }, { shouldPlay: false });
            await this.next.loadAsync({ uri: this.nextRow.FILE_PATH }, { shouldPlay: false });

            this.cur.setOnPlaybackStatusUpdate(this.playNextWhenDone);
            await this.cur.playAsync();
        } catch (error) {
            console.log("Error setting cur, next, and prev: ", error);
        }
    }
}