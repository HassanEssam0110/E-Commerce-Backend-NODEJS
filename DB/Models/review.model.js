import mongoose from 'mongoose';
import { ReviewStatus } from '../../src/Utils/index.js';

const { model, Schema } = mongoose;

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rate: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: String,
    reviewStatus: {
        type: String,
        enum: Object.values(ReviewStatus),
        default: ReviewStatus.Pending
    },
    actionDoneBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true, versionKey: false });



export const Review = mongoose.models.Review || model('Review', reviewSchema);