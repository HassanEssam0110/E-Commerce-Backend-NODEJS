import { catchError } from "../../Middlewares/index.js";
import { Product, Review, Order } from '../../../DB/Models/index.js';
import { ApiError, ApiFeatures, OrderSatus, sendResponse, ReviewStatus } from '../../Utils/index.js';

export const addReview = catchError(async (req, res, next) => {
    const userId = req.user._id;
    const { productId, rate, comment } = req.body;

    // check if user already reviewed this product
    const isReviewed = await Review.findOne({ user: userId, product: productId });
    if (isReviewed) return next(new ApiError('You have already reviewed this product.', 400, 'You have already reviewed this product.'));

    // check if product exist
    const product = await Product.findById(productId);
    if (!product) return next(new ApiError('Product not found.', 404, 'Product not found.'));

    // check if the user bought this product
    const isBought = await Order.findOne({
        user: userId,
        'products.productId': productId,
        orderStatus: OrderSatus.Delivered
    });
    if (!isBought) return next(new ApiError('you must buy this product first.', 400, 'you must buy this product first.'));

    const reviewObj = {
        user: userId,
        product: productId,
        rate,
        comment
    };

    const review = await Review.create(reviewObj);
    return sendResponse(res, { message: 'review added successfully.', data: review }, 201);
});


export const listReviews = catchError(async (req, res, next) => {
    // 1- Get total document count
    const countDocuments = await Order.countDocuments(); // get total document count

    // 2- Build query using ApiFeatures   
    const apiFeatures = new ApiFeatures(Review.find(), req.query)
        // .search()
        .filter()
        .sort()
        .fields()
        .pagination(countDocuments)

    // 3- Execute query
    const { mongooseQuery, paginationResult } = apiFeatures
    const documents = await mongooseQuery.populate([
        { path: 'user', select: 'username email' },
        { path: 'product', select: 'title' }]);

    return sendResponse(res, { pagination: paginationResult, count: documents.length, documents });
});

export const updateReviewStatus = catchError(async (req, res, next) => {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const { reviewStatus } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return next(new ApiError('Review not found.', 404, 'Review not found.'));

    if (reviewStatus === ReviewStatus.Approved) {
        review.reviewStatus = ReviewStatus.Approved;
    }
    else if (reviewStatus === ReviewStatus.Rejected) {
        review.reviewStatus = ReviewStatus.Rejected;
    }
    else {
        return next(new ApiError('please provide valid review status.', 400, 'please provide valid review status.'));
    }

    review.actionDoneBy = userId;
    const updatereview = await review.save();

    return sendResponse(res, { data: updatereview }, 200);
})