import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_OFFLINE, API_URL } from '../config';

// Keys for Local Storage
const USERS_KEY = 'offline_users';
const ATTENDANCE_KEY = 'offline_attendance';

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATABASE ---
const SEED_ADMIN = {
    employeeId: 'greenleaf',
    name: 'Greenleaf Admin',
    password: 'greenleaf@admin',
    role: 'admin',
    department: 'Management',
    faceData: 'admin-placeholder',
    status: 'Active'
};

export const api = {
    // 0. LOGIN
    login: async (employeeId, password) => {
        if (IS_OFFLINE) {
            await delay(800); // Fake network loading

            // Check Admin Hardcoded first (Fallback)
            if (employeeId === SEED_ADMIN.employeeId && password === SEED_ADMIN.password) {
                return { success: true, user: { ...SEED_ADMIN, id: SEED_ADMIN.employeeId } };
            }

            // Check Saved Users
            const usersRaw = await AsyncStorage.getItem(USERS_KEY);
            const users = usersRaw ? JSON.parse(usersRaw) : [];
            const user = users.find(u => u.employeeId === employeeId);

            if (!user) return { success: false, message: "User not found" };

            // Password check
            // Note: In offline mode, we store simple passwords. In real app, we'd hash.
            // For admin role, check password
            if (user.role === 'admin') {
                if (user.password !== password) return { success: false, message: "Invalid credentials" };
            }
            // For regular users, maybe password optional? Let's check matching if provided.
            if (user.password && user.password !== password) {
                return { success: false, message: "Invalid password" };
            }

            return {
                success: true,
                user: {
                    name: user.name,
                    id: user.employeeId,
                    role: user.role,
                    department: user.department
                }
            };
        } else {
            // Real Backend Call with Offline Fallback
            try {
                // Add Timeout to fail fast
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec timeout

                const response = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ employeeId, password }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return await response.json();
            } catch (err) {
                console.warn("Backend Unreachable, falling back to Offline Mode:", err.message);
                // --- FALLBACK LOGIC DUPLICATED FROM ABOVE ---
                // Re-run the offline logic
                await delay(800);
                if (employeeId === SEED_ADMIN.employeeId && password === SEED_ADMIN.password) {
                    return { success: true, user: { ...SEED_ADMIN, id: SEED_ADMIN.employeeId } };
                }
                const usersRaw = await AsyncStorage.getItem(USERS_KEY);
                const users = usersRaw ? JSON.parse(usersRaw) : [];
                const user = users.find(u => u.employeeId === employeeId);
                if (!user) return { success: false, message: "User not found (Offline)" };
                if (user.role === 'admin') {
                    if (user.password !== password) return { success: false, message: "Invalid credentials" };
                }
                return {
                    success: true,
                    user: { name: user.name, id: user.employeeId, role: user.role, department: user.department }
                };
            }
        }
    },

    // 1. REGISTER EMPLOYEE
    register: async (userData) => {
        const hasOfflineUsers = await AsyncStorage.getItem(USERS_KEY);

        // Helper to save locally
        const saveLocally = async (data) => {
            const usersRaw = await AsyncStorage.getItem(USERS_KEY);
            const users = usersRaw ? JSON.parse(usersRaw) : [];
            // Prevent duplicates
            if (users.find(u => u.employeeId === data.employeeId)) return { success: false, message: "ID already exists (Offline)" };

            users.push({ ...data, createdAt: new Date() });
            await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
            return { success: true, message: "Saved locally (Offline - Sync later)" };
        };

        if (IS_OFFLINE) {
            await delay(1000);
            return await saveLocally(userData);
        } else {
            try {
                // 5s Timeout for mobile networks
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(`${API_URL}/api/employees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error: ${response.status} - ${errorText}`);
                }
                return await response.json();
            } catch (err) {
                console.warn(`⚠️ Online Register Failed (${err.message}). Falling back to Offline Storage.`);
                return await saveLocally(userData);
            }
        }
    },

    // 2. LOG ATTENDANCE
    logAttendance: async (logData) => {
        if (IS_OFFLINE) {
            await delay(600);
            const logsRaw = await AsyncStorage.getItem(ATTENDANCE_KEY);
            const logs = logsRaw ? JSON.parse(logsRaw) : [];

            const newLog = {
                ...logData,
                timestamp: new Date().toISOString(),
                savedAt: new Date().toISOString()
            };
            logs.push(newLog);

            await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
            return { success: true, shift: 'Day' }; // Mock shift
        } else {
            try {
                const response = await fetch(`${API_URL}/api/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logData)
                });
                return await response.json();
            } catch (err) {
                console.warn("Backend Unreachable, logging locally:", err.message);
                // Fallback Logic
                await delay(600);
                const logsRaw = await AsyncStorage.getItem(ATTENDANCE_KEY);
                const logs = logsRaw ? JSON.parse(logsRaw) : [];

                const newLog = {
                    ...logData,
                    timestamp: new Date().toISOString(),
                    savedAt: new Date().toISOString()
                };
                logs.push(newLog);

                await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
                return { success: true, shift: 'Day (Offline)' };
            }
        }
    },

    // 3. GET STATUS / HISTORY
    getStatus: async (employeeId) => {
        if (IS_OFFLINE) {
            await delay(500);
            const logsRaw = await AsyncStorage.getItem(ATTENDANCE_KEY);
            const logs = logsRaw ? JSON.parse(logsRaw) : [];

            const userLogs = logs.filter(l => l.employeeId === employeeId);
            const lastLog = userLogs[userLogs.length - 1];

            // Calc mock status
            let status = 'Checked Out';
            if (lastLog && lastLog.type === 'Check In') status = 'Checked In';

            // Format for UI
            const recent = userLogs.slice(-3).reverse().map(l => ({
                date: new Date(l.timestamp).toLocaleDateString(),
                time: new Date(l.timestamp).toLocaleTimeString(),
                type: l.type,
                shift: 'Day'
            }));

            return {
                status,
                lastLog: lastLog ? {
                    date: new Date(lastLog.timestamp).toLocaleDateString(),
                    time: new Date(lastLog.timestamp).toLocaleTimeString(),
                    type: lastLog.type
                } : null,
                recent
            };
        } else {
            try {
                const response = await fetch(`${API_URL}/api/status/${employeeId}`);
                return await response.json();
            } catch (err) {
                console.warn("Backend Unreachable, checking local logs:", err.message);
                // Fallback Logic
                await delay(500);
                const logsRaw = await AsyncStorage.getItem(ATTENDANCE_KEY);
                const logs = logsRaw ? JSON.parse(logsRaw) : [];

                const userLogs = logs.filter(l => l.employeeId === employeeId);
                const lastLog = userLogs[userLogs.length - 1];
                let status = 'Checked Out';
                if (lastLog && lastLog.type === 'Check In') status = 'Checked In';

                return {
                    status,
                    lastLog: lastLog ? {
                        date: new Date(lastLog.timestamp).toLocaleDateString(),
                        time: new Date(lastLog.timestamp).toLocaleTimeString(),
                        type: lastLog.type
                    } : null,
                    recent: [] // offline recent logs difficult to format same way quickly
                };
            }
        }
    }
};
