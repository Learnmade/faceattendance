import { getBaseUrl } from '../config';

const getApiUrl = () => {
    return getBaseUrl();
}

export const logAttendanceToSheet = async (data) => {
    try {
        const url = `${getApiUrl()}/attendance`;
        console.log("Logging to:", url);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Check if response is JSON (sometimes tunnels return HTML on error)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from server");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error logging to sheet:", error);
        throw error;
    }
};

export const verifyUser = async () => {
    // OLD METHOD: Verify by ID (No longer used in Kiosk mode)
    return { success: true, user: { name: 'Demo User', id: 'EMP001' } };
};

// NEW: Identify User from Face (Mock)
export const identifyUser = async (faceImage) => {
    try {
        const response = await fetch(`${getApiUrl()}/identify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ faceImage })
        });
        return await response.json();
    } catch (error) {
        console.error("Identify Error", error);
        return { success: false };
    }
};

export const getUserStatus = async (employeeId) => {
    try {
        const response = await fetch(`${getApiUrl()}/status/${employeeId}`);
        return await response.json();
    } catch (error) {
        console.error("Status Error", error);
        return null;
    }
};
