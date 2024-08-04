import mongoose from '../global-setup.js';
const { model, Schema } = mongoose;

const reviewSchema = new Schema({
    comment: Sting,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rate: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
}, { timestamps: true, versionKey: false });


export const Review = model('Review', reviewSchema);