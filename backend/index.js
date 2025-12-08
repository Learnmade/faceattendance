const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const bcrypt = require('bcryptjs'); // Import bcrypt for security
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        // Initialize a dummy user if none exists
        const count = await User.countDocuments();
        if (count === 0) {
            await User.create({
                employeeId: 'EMP001',
                name: 'John Doe',
                department: 'IT',
                faceData: 'mock-face-data'
            });
            console.log("Mock user created");
        }

        // Ensure Greenleaf Admin exists and has HASHED password
        const adminUser = await User.findOne({ employeeId: 'greenleaf' });
        const hashedPassword = await bcrypt.hash('greenleaf@admin', 10);

        if (!adminUser) {
            await User.create({
                employeeId: 'greenleaf',
                name: 'Greenleaf Admin',
                password: hashedPassword,
                role: 'admin',
                department: 'Management',
                faceData: 'admin-placeholder', // Satisfy required field
                status: 'Active'
            });
            console.log("Admin user 'greenleaf' created.");
        } else {
            // Self-healing: Update password and ensure valid faceData to prevent Save errors
            adminUser.password = hashedPassword;
            if (!adminUser.faceData) adminUser.faceData = 'admin-placeholder';
            await adminUser.save();
            console.log("Admin user 'greenleaf' updated.");
        }
    })
    .catch(err => console.log('DB Error:', err));

// ... Google Sheets Setup ...
// (Assume setup is here or imported from similar config)
// Placeholder for sheet logic if not using a separate service file in this snippets
const sheetId = process.env.GOOGLE_SHEETS_ID;

// Routes

// 0. Login Endpoint (SECURED)
app.post('/api/login', async (req, res) => {
    const { employeeId, password } = req.body;
    try {
        const user = await User.findOne({ employeeId });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Admin Security Check
        if (user.role === 'admin') {
            if (!password) {
                return res.status(401).json({ success: false, message: "Password required for Admin" });
            }
            try {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ success: false, message: "Invalid credentials" });
                }
            } catch (bcryptError) {
                if (user.password === password) {
                    console.warn("Legacy plain text password detected for Admin. Updating to hash...");
                    user.password = await bcrypt.hash(password, 10);
                    await user.save();
                } else {
                    return res.status(500).json({ success: false, message: "Security Error" });
                }
            }
        }

        // Update Last Login (Best Effort)
        try {
            user.lastLogin = new Date();
            await user.save();
        } catch (saveError) {
            console.warn("Could not update lastLogin:", saveError.message);
        }

        res.json({
            success: true,
            user: {
                name: user.name,
                id: user.employeeId,
                role: user.role || 'user',
                department: user.department
            }
        });
    } catch (e) {
        console.error("Login Server Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// 1. Verify User (Mock) - Checks if an employee with ID exists
// In a real app, this would receive an image, extract face descriptor, and match with DB.
app.post('/api/verify', async (req, res) => {
    const { employeeId } = req.body; // Simulating ID scan or manual entry for now

    // NOTE: For real face recognition, we'd need Python or a SaaS API here.
    try {
        // Just find the first user for demo purposes or specific ID
        const user = await User.findOne({ employeeId: employeeId || 'EMP001' });
        if (user) {
            return res.json({ success: true, user: { name: user.name, id: user.employeeId } });
        }
        return res.status(404).json({ success: false, message: 'User not found' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// NEW: Identify User (Mock AI) for Kiosk Mode
// In production, this receives an image, sends to AI, and finds the Matching User ID.
app.post('/api/identify', async (req, res) => {
    try {
        // Mock Logic: We assume the face matches "John Doe" (EMP001) for demo.
        const matchedUserId = 'EMP001';

        const user = await User.findOne({ employeeId: matchedUserId });
        if (user) {
            return res.json({ success: true, user: { name: user.name, id: user.employeeId } });
        }
        return res.status(404).json({ success: false, message: 'Face not recognized' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Register New Employee (Admin) (SECURED)
app.post('/api/employees', async (req, res) => {
    const { name, employeeId, department, faceImage, password } = req.body;

    try {
        // 1. Save to MongoDB
        const existingUser = await User.findOne({ employeeId });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Employee ID already exists' });
        }

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const newUser = new User({
            employeeId,
            name,
            department,
            faceData: faceImage, // Storing Base64 for now
            password: hashedPassword
        });
        await newUser.save();
        console.log(`✅ [MongoDB] New Employee Registered: ${name} (${employeeId})`);

        // 2. Save to Google Sheets (Employees Tab)
        // Note: Google Sheets Logic should ideally be separated or error handled gracefully
        if (typeof googleSheets !== 'undefined' && typeof SHEET_ID !== 'undefined') {
            try {
                await googleSheets.spreadsheets.values.append({
                    spreadsheetId: SHEET_ID,
                    range: 'Employees!A:E',
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [
                            [employeeId, name, department, new Date().toLocaleDateString(), 'Active']
                        ]
                    }
                });
            } catch (sheetError) {
                console.warn("Could not save to Sheets (Employees tab might be missing):", sheetError.message);
            }
        }

        res.json({ success: true, message: 'Employee registered successfully' });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// 3. Log Attendance
app.post('/api/attendance', async (req, res) => {
    const { name, type, date, time, employeeId } = req.body;

    const now = new Date();
    // Helper function should be available in scope or imported
    const getShift = (date) => {
        const hour = date.getHours();
        // Morning: 06:00 to 14:00 (2 PM)
        if (hour >= 6 && hour < 14) return 'Morning';
        // Evening: 14:00 to 20:00 (8 PM)
        if (hour >= 14 && hour < 20) return 'Evening';
        // Night: 20:00 (8 PM) to 06:00
        return 'Night';
    };
    const shift = getShift(now);

    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString();

    try {
        // Fire and Forget Google Sheet Update (Background Process)
        // This ensures the Mobile App returns immediately and doesn't freeze waiting for Google.
        if (typeof googleSheets !== 'undefined' && typeof SHEET_ID !== 'undefined') {
            googleSheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: 'Sheet1!A:G',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [
                        [formattedDate, formattedTime, name, type, shift, 'Verified', employeeId]
                    ]
                }
            }).catch(err => console.error("Background Sheet Update Failed:", err.message));
        }

        // Return success immediately
        res.json({ success: true, shift });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: 'Failed to process request' });
    }
});

// 3. Get User Status & Recent Logs
app.get('/api/status/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (typeof googleSheets === 'undefined' || typeof SHEET_ID === 'undefined') {
            return res.json({ status: 'Unknown (Sheet Offline)', lastLog: null, recent: [] });
        }

        // Fetch from Google Sheets directly to get true state
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A:F', // Read all columns
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.json({ status: 'Unknown', lastLog: null, recent: [] });
        }

        const user = await User.findOne({ employeeId });
        if (!user) return res.status(404).json({ error: "User not found" });

        const userLogs = rows.filter(row => row[2] === user.name); // Col C is Name
        const recentLogs = userLogs.slice(-3).reverse(); // Last 3 logs
        const lastLog = userLogs[userLogs.length - 1];

        let currentStatus = 'Checked Out';
        if (lastLog && lastLog[3] === 'Check In') {
            currentStatus = 'Checked In';
        }

        res.json({
            status: currentStatus,
            lastLog: lastLog ? { date: lastLog[0], time: lastLog[1], type: lastLog[3] } : null,
            recent: recentLogs.map(l => ({ date: l[0], time: l[1], type: l[3], shift: l[4] }))
        });

    } catch (error) {
        console.error("Status Error:", error);
        // Fallback if sheet fails
        res.status(500).json({ error: "Failed to fetch status" });
    }
});

const os = require('os'); // To show network IP
const PORT = process.env.PORT || 5000;

// Export for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🟢 Greenleaf Backend Running on port ${PORT}`);

        // Log Network IPs to help user fix "Server Not Found"
        console.log("------------------------------------------------");
        console.log(`Local via Emulator:   http://10.0.2.2:${PORT}`);
        console.log(`Local via LAN:        http://${getLocalIp()}:${PORT}`);
        console.log("------------------------------------------------\n");
    });
}

// Routes Additions
// Health Check for App to Verify Connection & DB Status
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const statusMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting',
    };
    res.json({
        status: dbState === 1 ? 'OK' : 'Error',
        message: 'Greenleaf Server is Online',
        database: statusMap[dbState] || 'Unknown',
        timestamp: new Date()
    });
});

// Helper to get Local IP
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// 0. Login Endpoint Update to track Last Login
// 0. Login Endpoint moved to top
