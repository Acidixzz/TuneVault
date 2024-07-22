import AsyncStorage from '@react-native-async-storage/async-storage';
import { err } from 'react-native-svg';

export const FOOTER_SETTINGS_KEY = 'FOOTER_SETTINGS';

export default class SettingsHandler {


    constructor() {
        this.footerSettings = {
            shuffle: false,
            previous: false,
            play: false,
            next: false
        }

        this.listeners = []; //listeners will be in this format { update: () => void }

        loadInitialStorage = async () => {
            let jsonData = await AsyncStorage.getItem(FOOTER_SETTINGS_KEY);
            //console.log(jsonData);
            this.footerSettings = JSON.parse(jsonData);
        }
        loadInitialStorage();
    }

    updateFooterSettings = async (obj) => {
        try {
            await AsyncStorage.setItem(FOOTER_SETTINGS_KEY, JSON.stringify(obj));
            this.listeners.forEach((item) => { item.update(obj) });
        } catch (error) {
            console.log('updateFooterSettingsError', error);
        }
    }
}