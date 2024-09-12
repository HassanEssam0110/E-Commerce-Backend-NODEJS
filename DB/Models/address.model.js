import mongoose from '../global-setup.js';

const { model, Schema } = mongoose;

const addressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postalCode: {
        type: Number,
        required: true
    },
    buildingNumber: {
        type: Number,
        required: true
    },
    floorNumber: {
        type: Number,
        required: true
    },
    addressLabel: {
        type: String,
        required: false
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    isMarkedAsDeleted: {
        type: Boolean,
        default: false,
        required: false
    }
}, { timestamps: true, versionKey: false });


export const Address = mongoose.models.Address || model('Address', addressSchema);
