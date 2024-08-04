import { nanoid } from "nanoid";
import { Product } from "../../../DB/Models/product.model.js";
import { catchError } from "../../Middlewares/index.js";
import { ApiError, sendResponse, uploadFile } from "../../Utils/index.js";



/**
 * @description create new product.
 * @route {POST} /api/v1/products/create
 * @access Private
 */
export const createProduct = catchError(async (req, res, next) => {
    // destructure req.body
    const { title, overview, specs, price, discountAmount, discountType, stock } = req.body;

    // req.files
    if (!req.files.length)
        return next(new ApiError('No images uploaded.', 400));

    // check brand
    const brandDocument = await req.document;

    // Images Section 
    const categoryCustomId = brandDocument.category.image.customId;
    const subCategoryCustomId = brandDocument.subCategory.image.customId;
    const brandCustomId = brandDocument.logo.customId;
    const customId = nanoid(6);
    const folder = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/sub-categories/${subCategoryCustomId}/brands/${brandCustomId}/products/${customId}`
    const URLS = [];
    for (const file of req.files) {
        // upload image to cloudinary
        const { secure_url, public_id } = await uploadFile({
            file: file.path,
            folder
        })
        URLS.push({ secure_url, public_id })
    }

    const productObject = {
        title,
        overview,
        specs: JSON.parse(specs),
        price,
        appliedDiscount: {
            amount: discountAmount,
            type: discountType
        },
        stock,
        images: {
            URLS,
            customId
        },
        brand: brandDocument._id,
        category: brandDocument.category._id,
        subCategory: brandDocument.subCategory._id,
    };

    const newProduct = await Product.create(productObject);
    return sendResponse(res, { data: newProduct }, 201);
});



/**
 * @description  update a product
 * @route {PUT} /api/v1/products/update/:_id
 * @access Private
 */
export const updateProduct = catchError(async (req, res, next) => {
    const product = await req.document;
    const { title, overview, specs, price, discountAmount, discountType, stock } = req.body;

    if (title) product.title = title;
    if (overview) product.overview = overview;
    if (stock) product.overview = stock;
    if (price) product.price = price;
    if (discountAmount) product.appliedDiscount.amount = discountAmount;
    if (discountType) product.appliedDiscount.type = discountType;
    if (specs) product.specs = JSON.parse(specs);

    const updatedProduct = await product.save();
    return sendResponse(res, { data: updatedProduct });
});


export const getProductList = catchError(async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.paginate({}, {
        page,
        limit,
        skip,
    });

    return sendResponse(res, { data: products });
});