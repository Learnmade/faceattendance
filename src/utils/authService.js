import * as SecureStore from 'expo-secure-store';

const KEY = 'auth_session';

export const saveUserSession = async (user) => {
    try {
        await SecureStore.setItemAsync(KEY, JSON.stringify(user));
    } catch (e) {
        console.error("Save session failed", e);
    }
};

export const getUserSession = async () => {
    try {
        const session = await SecureStore.getItemAsync(KEY);
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
};

export const clearUserSession = async () => {
    await SecureStore.deleteItemAsync(KEY);
};
