const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
    process.exit(1);
}

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB Connected");

        // DROP LEGACY INDEX if it exists to fix "dup key: { email: null }"
        try {
            await mongoose.connection.collection('users').dropIndex('email_1');
            console.log("⚠️ Legacy 'email_1' index dropped.");
        } catch (e) {
            // Index might not exist, which is fine
        }

        const adminId = 'admin_user'; // New explicit admin
        const initialPassword = 'admin123';

        // Check if exists
        const existingAdmin = await User.findOne({ employeeId: adminId });
        if (existingAdmin) {
            console.log(`⚠️ Admin '${adminId}' already exists. Updating password...`);
            existingAdmin.password = await bcrypt.hash(initialPassword, 10);
            existingAdmin.role = 'admin';
            existingAdmin.status = 'Active';
            await existingAdmin.save();
            console.log("✅ Admin updated successfully.");
        } else {
            const hashedPassword = await bcrypt.hash(initialPassword, 10);
            const newAdmin = new User({
                employeeId: adminId,
                name: "System Administrator",
                department: "IT Security",
                role: "admin",
                status: "Active",
                password: hashedPassword,
                faceData: "manual-entry" // Placeholder
            });
            await newAdmin.save();
            console.log(`✅ New Admin User Created: ${adminId}`);
        }

        console.log("\n📋 CREDENTIALS:");
        console.log(`🆔 ID:       ${adminId}`);
        console.log(`🔒 Password: ${initialPassword}`);

    } catch (error) {
        console.error("❌ Error creating admin:", error);
    } finally {
        mongoose.connection.close();
    }
};

createAdmin();
