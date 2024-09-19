import { Router } from "express";
import { auth } from "../../Middlewares/index.js";
import * as controller from './review.controller.js';

const reviewRouter = Router();

reviewRouter.post('/add', auth, controller.addReview);
reviewRouter.get('/', auth, controller.listReviews);
reviewRouter.put('/approve-reject/:reviewId', auth, controller.updateReviewStatus);

export {
    reviewRouter
}