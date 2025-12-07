const mongoose = require('mongoose');

// Advanced Employee Schema matching Greenleaf requirements
const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: [true, 'Full Name is required'],
        trim: true
    },
    password: {
        type: String,
        select: true // Kept true for now to allow comparison, usually false in high-security
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'manager'],
        default: 'user'
    },
    department: {
        type: String,
        default: 'General',
        trim: true
    },
    // Stores Base64 string of the face image or a link to cloud storage
    faceData: {
        type: String,
        required: [true, 'Face data/photo is required for biometric authentication'],
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
