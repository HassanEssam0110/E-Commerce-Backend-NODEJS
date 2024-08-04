import mongoose from '../global-setup.js';

import { Badgs, DiscountType, generateSlug } from '../../src/Utils/index.js';

const { model, Schema } = mongoose;


const productSchema = new Schema({
    title: {
        type: String,
        unique: [true, 'title is required.'],
        trim: true,
        required: true,
        minLength: [2, 'too short product title.']
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
    },
    overview: {
        type: String,
        required: true,
    },
    specs: Object,
    badge: {
        type: String,
        enum: Object.values(Badgs)
    },

    // Numbers Section
    price: {
        type: Number,
        required: true,
        min: 10,
    },
    appliedDiscount: {
        amount: {
            type: Number,
            min: 0,
            default: 0
        },
        type: {
            type: String,
            enum: Object.values(DiscountType),
            default: DiscountType.Percentage
        }
    },
    appliedPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    sold: Number,
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    rateCount: Number,


    // Images Section
    images: {
        URLS: [
            {
                secure_url: {
                    type: String,
                    required: true,
                },
                public_id: {
                    type: String,
                    required: true,
                    unique: true,
                },
            },
        ],
        customId: {
            type: String,
            required: true,
            unique: true,
        },
    },

    // Ids sections
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
}, { timestamps: true, versionKey: false });


// Middleware to generate slug before validation
productSchema.pre('validate', function (next) {
    const { title, price, appliedDiscount } = this;

    // Check if the 'title' field has been modified
    if (this.isModified('title')) {
        this.slug = generateSlug(title);
    }

    // Check if the 'price' or 'appliedDiscount' fields have been modified
    if (this.isModified('price') || this.isModified('appliedDiscount.amount') || this.isModified('appliedDiscount.type')) {
        const { type, amount } = appliedDiscount || {};
        if (type === DiscountType.Percentage) {
            this.appliedPrice = price - (price * amount) / 100;
        } else if (type === DiscountType.Fixed) {
            this.appliedPrice = price - amount;
        } else {
            this.appliedPrice = price;
        }
    }

    next();
});

export const Product = model('Product', productSchema);