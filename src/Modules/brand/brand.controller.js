import { nanoid } from 'nanoid';

import { catchError } from '../../Middlewares/index.js';
import { ApiError, cloudinaryConfig, sendResponse, uploadFile } from '../../Utils/index.js';
import { Brand, Product } from '../../../DB/Models/index.js';



/**
 * @description Create new brand.
 * @route {POST} /api/v1/brands/create
 * @access Private
 */
export const createBrand = catchError(async (req, res, next) => {
    const subCategory = await req.document;
    const { category } = subCategory;
    const { name } = req.body;
    const user = req.user;

    // Uploade image to cloudnary.
    const customId = nanoid(6);
    const { secure_url, public_id } = await uploadFile({
        file: req.file?.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${category.image.customId}/sub-categories/${subCategory.image.customId}/brands/${customId}`
    });

    // prepare brand object
    const brand = {
        name,
        logo: {
            secure_url,
            public_id,
            customId,
        },
        category: category._id,
        subCategory: subCategory._id,
        createdBy: user._id
    };

    const newBrand = await Brand.create(brand);
    return sendResponse(res, { data: newBrand }, 201);
});


/**
 * @description get a brand by name, id, or slug.
 * @route {GET} /api/v1/brands/get-category
 * @apiParam {String} [id] The ID of the brand.
 * @apiParam {String} [name] The name of the brand.
 * @apiParam {String} [slug] The slug of the brand.
 * @access Public
 */
export const getBrand = catchError(async (req, res, next) => {
    const { id, name, slug } = req.query;
    const queryFilter = {};

    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;

    const brand = await Brand.findOne(queryFilter).populate([
        { path: 'category', select: 'name image' },
        { path: 'subCategory', select: 'name image' }]);

    if (!brand) return next(new ApiError('not found.', 404));
    return sendResponse(res, { data: brand });
});


/**
 * @description  update a sub-category
 * @route {PUT} /api/v1/sub-categories/update/:_id
 * @access Private
 */
export const updateBrand = catchError(async (req, res, next) => {

    const brand = await req.document;


    if (req.body?.name) {
        brand.name = req.body.name;
    }


    // Handle file upload and update image URL if a file is provided
    if (req.file) {
        const { public_id, customId } = brand?.logo;
        const { category, subCategory } = brand;
        const splitedPublicId = public_id.split(`${customId}/`)[1];

        const { secure_url } = await uploadFile({
            file: req.file?.path,
            folder: `${process.env.UPLOADS_FOLDER}/categories/${category.image.customId}/sub-categories/${subCategory.image.customId}/brands/${customId}`,
            publicId: splitedPublicId
        })

        brand.logo.secure_url = secure_url;
    }

    const updatedBrand = await brand.save();
    return sendResponse(res, { data: updatedBrand });
});


/**
 * @description  delete a brand
 * @route {PUT} /api/v1/brands/delete/:_id
 * @access Private
 */
export const deleteBrand = catchError(async (req, res, next) => {
    const brand = await req.document;

    const { category, subCategory } = brand;
    const brandPath = `${process.env.UPLOADS_FOLDER}/categories/${category.image.customId}/sub-categories/${subCategory.image.customId}/brands/${brand.logo.customId}`

    // Delete images from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
    await cloudinaryConfig().api.delete_folder(brandPath);

    // Delete Brand
    await brand.deleteOne();

    return sendResponse(res);
});


/**
 * @description   Get a list of brand with their related products.
 * @route {GET} /api/v1/brands
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=5] - Number of items per page for pagination.
 */
export const getBrandList = catchError(async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const brands = await Brand.paginate({}, {
        page,
        limit,
        skip,
    });

    // Convert the paginated result to plain object to add subcategories
    const brandDocs = brands.docs.map(brand => brand.toObject());

    await Promise.all(brandDocs.map(async brand => {
        const products = await Product.find({ brand: brand._id })
        brand.products = products;
    }));

    brands.docs = brandDocs;
    return sendResponse(res, { data: brands });
});


/**
 * @description   Search for brands with optional filters for name, category, and subcategory.
 * @route {GET} /api/v1/brands/search
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=5] - Number of items per page for pagination.
 * @param {string} [req.query.name] - Name of the brand to search for.
 * @param {string} [req.query.category] - Category to filter brands.
 * @param {string} [req.query.subCategory] - Subcategory to filter brands.
 */
export const searchBrands = catchError(async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const { name, category, subCategory } = req.query;

    const queryFilter = {
        $or: []
    };

    if (name) {
        queryFilter.$or.push({ name: { $regex: name, $options: 'i' } });
    }

    if (category) {
        queryFilter.$or.push({ category });
    }

    if (subCategory) {
        queryFilter.$or.push({ subCategory });
    }

    // If no filters are applied, remove the $or field to prevent an empty query
    if (queryFilter.$or.length === 0) {
        delete queryFilter.$or;
    }

    const brands = await Brand.paginate(queryFilter, {
        page,
        limit,
        skip,
        populate: 'category subCategory',
    })


    if (!brands) return next(new ApiError('not found.', 404));
    return sendResponse(res, { data: brands });
});


