import mongoose from '../global-setup.js';

import { Gender, SystemRoles, bcryptHashData } from '../../src/Utils/index.js';

const { model, Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'User name is required.'],
    },
    email: {
        type: String,
        required: [true, 'email is required.'],
        unique: [true, 'email is alerdy taken.'],
    },
    emailVerifyCode: String,
    emailVerifyExpires: Date,
    password: {
        type: String,
        required: [true, 'password is required.'],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    age: {
        type: Number,
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        default: Gender.Male
    },
    phone: {
        type: String,
    },

    isEmailvalidated: {
        type: Boolean,
        default: false
    },
    isMarkedAsDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(SystemRoles),
        default: SystemRoles.USER
    },
}, { timestamps: true, versionKey: false });

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.password = bcryptHashData(this.password);
    }
    next();
})

export const User = mongoose.models.User || model('User', userSchema);