const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    nextLevelXp: {
        type: Number,
        default: 100
    },
    profileImage: {
        type: String,
        default: 'default-avatar.png'
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    birthDate: {
        type: Date,
        default: null
    },
    boxes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box'
    }]
}, {
    timestamps: true,
    strict: true,
    strictQuery: true
});

userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('users', userSchema);

module.exports = User; 