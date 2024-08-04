import { nanoid } from 'nanoid';

import { catchError } from '../../Middlewares/index.js';
import { ApiError, cloudinaryConfig, generateSlug, sendResponse, uploadFile } from '../../Utils/index.js';
import { Category, SubCategory, Brand } from '../../../DB/Models/index.js';


/**
 * @description Create new category.
 * @route {POST} /api/v1/categories/create
 * @access Private
 */
export const createCategory = catchError(async (req, res, next) => {
    const { name } = req.body;

    // Uploade image to cloudnary.
    const customId = nanoid(6);
    const { secure_url, public_id } = await uploadFile({
        file: req.file?.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${customId}`
    })

    // prepare category object
    const category = {
        name,
        image: {
            secure_url,
            public_id,
            customId,
        },
    }

    const newCategory = await Category.create(category);
    return sendResponse(res, { data: newCategory }, 201);
})


/**
 * @description get a category by name, id, or slug.
 * @route {GET} /api/v1/categories/get-category
 * @apiParam {String} [id] The ID of the category.
 * @apiParam {String} [name] The name of the category.
 * @apiParam {String} [slug] The slug of the category.
 * @access Public
 */
export const getCategory = catchError(async (req, res, next) => {
    const { id, name, slug } = req.query;
    const queryFilter = {};

    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;

    const category = await Category.findOne(queryFilter);
    if (!category) return next(new ApiError('not found.', 404));
    return sendResponse(res, { data: category });
});


/**
 * @description  update a category
 * @route {PUT} /api/v1/categories/update/:_id
 * @access Private
 */
export const updateCategory = catchError(async (req, res, next) => {
    const category = req.document;

    // Update the category name if provided
    if (req.body?.name) {
        category.name = req.body.name;
    }

    // Handle file upload and update image URL if a file is provided
    if (req.file) {
        const { public_id, customId } = category?.image;
        const splitedPublicId = public_id.split(`${customId}/`)[1];

        const { secure_url } = await uploadFile({
            file: req.file.path,
            folder: `${process.env.UPLOADS_FOLDER}/categories/${customId}`,
            publicId: splitedPublicId
        })

        category.image.secure_url = secure_url;
    }

    const updatedCategory = await category.save();
    return sendResponse(res, { data: updatedCategory });
});

/**
 * @description  delete a category
 * @route {PUT} /api/v1/categories/delete/:_id
 * @access Private
 */
export const deleteCategory = catchError(async (req, res, next) => {
    const category = req.document;
    const categoryPath = `${process.env.UPLOADS_FOLDER}/categories/${category.image.customId}`

    // Delete images from cloudinary 
    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    await cloudinaryConfig().api.delete_folder(categoryPath);

    // Delete category 
    const deletedCategory = await category.deleteOne();

    // Delete relevent sub-category 
    if (deletedCategory.deletedCount) {

        const deletedSubCategories = await SubCategory.deleteMany({ category: category._id });

        // Delete relevent brand
        if (deletedSubCategories.deletedCount) {
            const deletedBrands = await Brand.deleteMany({ category: category._id });
        }
    }


    return sendResponse(res);
});


/**
 * @description   Get a list of categories with their related subcategories.
 * @route {GET} /api/v1/categories
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=5] - Number of items per page for pagination.
 */
export const getCategoryList = catchError(async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const categories = await Category.paginate({}, {
        page,
        limit,
        skip,
    });
 
    // Convert the paginated result to plain object to add subcategories
    const categoryDocs = categories.docs.map(category => category.toObject());

    await Promise.all(categoryDocs.map(async category => {
        const subCategories = await SubCategory.find({ category: category._id })
        category.subCategories = subCategories;
    }));

    categories.docs = categoryDocs;
    return sendResponse(res, { data: categories });
});