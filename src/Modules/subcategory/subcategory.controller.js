import { nanoid } from 'nanoid';

import { catchError } from '../../Middlewares/index.js';
import { ApiError, cloudinaryConfig, sendResponse, uploadFile } from '../../Utils/index.js';
import { Brand, SubCategory } from '../../../DB/Models/index.js';



/**
 * @description Create new sub-category.
 * @route {POST} /api/v1/sub-categories/create
 * @access Private
 */
export const createSubCategory = catchError(async (req, res, next) => {
    const category = req.document;
    const { name } = req.body;

    // Uploade image to cloudnary.
    const customId = nanoid(6);
    const { secure_url, public_id } = await uploadFile({
        file: req.file?.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${category.image.customId}/sub-categories/${customId}`
    })

    // prepare sub-category object
    const subcategory = {
        name,
        image: {
            secure_url,
            public_id,
            customId,
        },
        category: category._id
    }

    const newSubCategory = await SubCategory.create(subcategory);
    return sendResponse(res, { data: newSubCategory }, 201);
})


/**
 * @description get a sub-category by name, id, or slug.
 * @route {GET} /api/v1/sub-categorie/get-category
 * @apiParam {String} [id] The ID of the sub-categorie.
 * @apiParam {String} [name] The name of the sub-categorie.
 * @apiParam {String} [slug] The slug of the sub-categorie.
 * @access Public
 */
export const getSubCategory = catchError(async (req, res, next) => {
    const { id, name, slug } = req.query;
    const queryFilter = {};

    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;

    const subCategory = await SubCategory.findOne(queryFilter).populate('category');
    if (!subCategory) return next(new ApiError('not found.', 404));
    return sendResponse(res, { data: subCategory });
});


/**
 * @description  update a sub-category
 * @route {PUT} /api/v1/sub-categories/update/:_id
 * @access Private
 */
export const updateSubCategory = catchError(async (req, res, next) => {
    const subCategory = await req.document;

    if (req.body?.name) {
        subCategory.name = req.body.name;
    }


    // Handle file upload and update image URL if a file is provided
    if (req.file) {
        const { public_id, customId } = subCategory?.image;
        const { category } = subCategory;
        const splitedPublicId = public_id.split(`${customId}/`)[1];

        const { secure_url } = await uploadFile({
            file: req.file?.path,
            folder: `${process.env.UPLOADS_FOLDER}/categories/${category.image.customId}/sub-categories/${customId}`,
            publicId: splitedPublicId

        })

        subCategory.image.secure_url = secure_url;
    }

    const updatedSubCategory = await subCategory.save();
    return sendResponse(res, { data: updatedSubCategory });
})


/**
 * @description  delete a sub-category
 * @route {PUT} /api/v1/sub-categories/delete/:_id
 * @access Private
 */
export const deleteSubCategory = catchError(async (req, res, next) => {
    const subCategory = await req.document;
    const { category } = subCategory;

    const subCategoryPath = `${process.env.UPLOADS_FOLDER}/categories/${category.image.customId}/sub-categories/${subCategory.image.customId}`

    // Delete images from cloudinary 
    await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath);
    await cloudinaryConfig().api.delete_folder(subCategoryPath);

    // Delete sub-category 
    const deletedSubCategory = await subCategory.deleteOne();

    // Delete relevent brands
    if (deletedSubCategory.deletedCount) {
        await Brand.deleteMany({ subCategory: subCategory._id });
    }

    return sendResponse(res);
});


/**
 * @description   Get a list of sub-categories with their related brands.
 * @route {GET} /api/v1/categories
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=5] - Number of items per page for pagination.
 */
export const getSubCategoryList = catchError(async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const subCategories = await SubCategory.paginate({}, {
        page,
        limit,
        skip,
    });

    // Convert the paginated result to plain object to add subcategories
    const subCategoryDocs = subCategories.docs.map(subCategory => subCategory.toObject());

    await Promise.all(subCategoryDocs.map(async subCategory => {
        const brands = await Brand.find({ subCategory: subCategory._id })
        subCategory.brands = brands;
    }));

    subCategories.docs = subCategoryDocs;
    return sendResponse(res, { data: subCategories });
});
