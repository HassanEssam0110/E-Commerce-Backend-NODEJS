import mongoose from '../global-setup.js';
const { model, Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
}, { timestamps: true, versionKey: false });


export const User = model('User', userSchema);