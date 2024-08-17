import mongoose from '../global-setup.js';

import { generateSlug } from '../../src/Utils/index.js';

const { model, Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        unique: [true, 'The name must be unique.'],
        required: [true, 'The name is required.'],
        trim: true,
        minLength: [2, 'The category name is too short.']
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
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true, versionKey: false });


// Middleware to generate slug before validation
categorySchema.pre('validate', function (next) {
    if (this.isModified('name')) {
        // Check if the 'name' field has been modified (for both create and update operations)
        this.slug = generateSlug(this.name);
    }
    next();
});

categorySchema.post('deleteOne', async function () {
    const _id = this.getQuery()._id;
    // Delete relevent sub-category 
    const deletedSubCategories = await mongoose.models.SubCategory.deleteMany({ category: _id });

    // Delete relevent brand
    if (deletedSubCategories.deletedCount) {
        const deletedBrands = await mongoose.models.Brand.deleteMany({ category: _id });

        // Delete relevent products
        if (deletedBrands.deletedCount) {
            const deletedProducts = await mongoose.models.Product.deleteMany({ category: _id });
        }

    }
});

export const Category = model('Category', categorySchema);