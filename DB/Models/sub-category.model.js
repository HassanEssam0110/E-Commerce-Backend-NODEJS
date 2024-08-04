import mongoose from '../global-setup.js';

import { generateSlug } from '../../src/Utils/index.js';

const { model, Schema } = mongoose;

const subcategorySchema = new Schema({
    name: {
        type: String,
        unique: [true, 'The name must be unique.'],
        required: [true, 'The name is required.'],
        trim: true,
        minLength: [2, 'The sub-category name is too short.']
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,

    },
    image: {
        secure_url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
            unique: true,
        },
        customId: {
            type: String,
            required: true,
        }
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true, versionKey: false });


// Middleware to generate slug before validation
subcategorySchema.pre('validate', function (next) {
    if (this.isModified('name')) {
        // Check if the 'name' field has been modified (for both create and update operations)
        this.slug = generateSlug(this.name);
    }
    next();
});

export const SubCategory = model('SubCategory', subcategorySchema);