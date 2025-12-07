// Config for API Connection
// For Android Emulator, use 'http://10.0.2.2:5000' to reach the host computer.
// For Physical Device, use your machine's LAN IP (e.g., 'http://192.168.1.5:5000').

const EMULATOR_HOST = 'http://10.0.2.2:5000';
const LAN_HOST = 'http://192.168.31.67:5000'; // Your current Local IP
const CLOUD_URL = 'https://face-attendance-backend-fi7grtd9q-learnmades-projects.vercel.app';

// Toggle this to switch environments
// SET TO TRUE to run WITHOUT a server (Data saved on phone)
const USE_OFFLINE_MODE = false;

// If Offline Mode is OFF, use these:
const IS_DEV = true; // Set to true for local backend, false for Vercel
export const API_URL = IS_DEV ? LAN_HOST : CLOUD_URL;
export const IS_OFFLINE = USE_OFFLINE_MODE;
