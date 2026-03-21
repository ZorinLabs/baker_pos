import axios from 'axios';

// Using a public "Bin" service for real-time data sync without complex DB setup.
// This allows multiple devices to share the same state over the internet.
const BIN_ID = 'bakery_pos_global_v1';
const API_URL = `https://kv.val.run/${BIN_ID}`;

export const syncService = {
    // Save current state to the cloud
    async saveState(state) {
        try {
            await axios.post(API_URL, state);
            return true;
        } catch (error) {
            console.error('Sync failed:', error);
            return false;
        }
    },

    // Load current state from the cloud
    async loadState() {
        try {
            const { data } = await axios.get(API_URL);
            return data;
        } catch (error) {
            console.error('Load failed:', error);
            return null;
        }
    }
};
