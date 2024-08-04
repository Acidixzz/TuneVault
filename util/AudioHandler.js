import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";

export default class AudioHandler {

    constructor(songs = null) {
        try {
            const loadAudio = async () => {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: true,
                });
            }
            loadAudio();
            this.songs = songs; //only here to automatically play the next song

            this.queue = [];

            this.cur = new Audio.Sound();
            this.prev = new Audio.Sound();
            this.next = new Audio.Sound();

            //this will be the row data for prev and next
            this.prevRow = null;
            this.curRow = null;
            this.nextRow = null;

            this.listeners = [] //listener objects that can have functions on them to update ui

        } catch (error) {
            console.log("Error initializing AudioHandler: ", error);
        }
    }

    playNextWhenDone = status => {
        if (status.didJustFinish) {
            this.playNext(this.songs);
        }
        if (this.listeners) {
            this.listeners.forEach((item) => {
                if (status.positionMillis && status.durationMillis) {
                    item.updateProgress(status.positionMillis / status.durationMillis);
                }
            });
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
            if (this.cur._loaded) {
                await this.cur.stopAsync();
            }
            else {
                return;
            }
            this.songs = songs;
            await this.next.unloadAsync();
            let temp = this.next;

            this.next = this.cur;
            this.cur = this.prev;

            this.nextRow = this.curRow;
            this.curRow = this.prevRow;

            console.log('cur:', this.curRow, 'next:', this.nextRow);

            if (this.listeners) {
                this.listeners.forEach(item => {
                    item.update(this.curRow);
                    item.updateIsPlaying(true);
                });
            }

            if (this.queue.length === 0) {
                await this.next.unloadAsync();
                await this.next.loadAsync({ uri: this.nextRow.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 })
            }

            this.cur.setOnPlaybackStatusUpdate(this.playNextWhenDone);

            if (this.cur._loaded) {
                await this.cur.playAsync();
            }

            let curIndex = await songs.findIndex((item) => item.SONG_GU === this.curRow.SONG_GU);
            this.prevRow = await songs[curIndex > 0 ? curIndex - 1 : songs.length - 1];

            this.prev = temp;
            await this.prev.loadAsync({ uri: this.prevRow.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 });
        } catch (error) {
            console.log("Error when clicking prev: ", error);
        }
    }

    playNext = async (songs) => {
        try {
            if (this.cur._loaded) {
                await this.cur.stopAsync();
            }
            else {
                return;
            }

            if (this.queue.length > 0) {
                if (this.prevRow !== this.curRow) {
                    this.prevRow = this.curRow; //so then when they click previous it goes the song last played in the actual playlist order before the queue songs started
                    await this.prev.unloadAsync();
                    await this.prev.loadAsync({ uri: this.prevRow.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 })
                }

                await this.cur.unloadAsync();
                await this.cur.loadAsync({ uri: this.queue[0].FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 });

                if (this.listeners) {
                    this.listeners.forEach(item => {
                        item.update(this.queue[0]);
                        item.updateIsPlaying(true);
                    });
                }

                this.queue.shift();

                this.cur.setOnPlaybackStatusUpdate(this.playNextWhenDone);

                if (this.cur._loaded) {
                    await this.cur.playAsync();
                }
                return;
            }

            this.songs = songs;
            await this.prev.unloadAsync();
            let temp = this.prev;

            this.prev = this.cur;
            this.cur = this.next;

            this.prevRow = this.curRow;
            this.curRow = this.nextRow;
            if (this.listeners) {
                this.listeners.forEach(item => {
                    item.update(this.curRow);
                    item.updateIsPlaying(true);
                });
            }

            if (this.queue.length === 0) {
                await this.prev.unloadAsync();
                await this.prev.loadAsync({ uri: this.prevRow.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 })
            }

            this.cur.setOnPlaybackStatusUpdate(this.playNextWhenDone);

            if (this.cur._loaded) {
                await this.cur.playAsync();
            }

            let curIndex = await songs.findIndex(item => item.SONG_GU === this.curRow.SONG_GU);
            this.nextRow = await songs[curIndex < songs.length - 1 ? curIndex + 1 : 0];

            this.next = temp;
            await this.next.loadAsync({ uri: this.nextRow.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 });
        } catch (error) {
            console.log("Error when clicking next: ", error);
        }
    }

    reset = async () => {
        try {

            await this.cur.unloadAsync();
            await this.prev.unloadAsync();
            await this.next.unloadAsync();
            this.curRow = null;
            this.nextRow = null;
            this.prevRow = null;
            this.songs = null;

        } catch (error) {
            console.log('restError', error);
        }
    }

    setCurNextPrev = async (cur, songs, fromFooter = false) => {
        try {
            if (this.cur._loaded && this.curRow.SONG_GU === cur.SONG_GU && !fromFooter) {
                return;
            }

            this.songs = songs;

            if (!fromFooter) await this.cur.unloadAsync();
            await this.prev.unloadAsync();
            await this.next.unloadAsync();

            let curIndex = songs.findIndex(item => item.SONG_GU === cur.SONG_GU);
            this.prevRow = songs[curIndex > 0 ? curIndex - 1 : songs.length - 1];
            this.curRow = cur;
            this.nextRow = songs[curIndex < songs.length - 1 ? curIndex + 1 : 0];


            if (!fromFooter) await this.cur.loadAsync({ uri: cur.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 });
            await this.prev.loadAsync({ uri: this.prevRow.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 });
            await this.next.loadAsync({ uri: this.nextRow.FILE_PATH }, { shouldPlay: false, progressUpdateIntervalMillis: 100 });

            if (this.listeners && !fromFooter) {
                this.listeners.forEach(item => {
                    item.update(cur);
                    item.updateIsPlaying(true);
                });
            }

            if (!fromFooter) this.cur.setOnPlaybackStatusUpdate(this.playNextWhenDone);
            if (this.cur._loaded && !fromFooter) {
                await this.cur.playAsync();
            }
        } catch (error) {
            console.log("Error setting cur, next, and prev: ", error);
        }
    }

    addToQueue = (song) => {
        try {
            this.queue.push(song);
            console.log(this.queue);
        } catch (error) {
            console.log('addToQueueError:', error);
        }
    }
}