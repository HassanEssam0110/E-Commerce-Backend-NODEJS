import mongoose from '../global-setup.js';


import { generateSlug } from '../../src/Utils/index.js';

const { model, Schema } = mongoose;

const brandSchema = new Schema({
    name: {
        type: String,
        unique: [true, 'The name must be unique.'],
        required: [true, 'The name is required.'],
        trim: true,
        minLength: [2, 'The brand name is too short.']
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    logo: {
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
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true, versionKey: false });


// Middleware to generate slug before validation
brandSchema.pre('validate', function (next) {
    if (this.isModified('name')) {
        // Check if the 'name' field has been modified (for both create and update operations)
        this.slug = generateSlug(this.name);
    }
    next();
});

brandSchema.post('deleteOne', async function () {
    const _id = this.getQuery()._id;
    // Delete relevent products
    const deletedProducts = await mongoose.models.Product.deleteMany({ brand: _id });
    console.log({ deletedProducts });
});


export const Brand = mongoose.models.Brand || model('Brand', brandSchema);