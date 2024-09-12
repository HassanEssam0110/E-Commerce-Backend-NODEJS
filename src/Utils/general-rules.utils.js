import Joi from "joi";
import mongoose from "mongoose";


const objectValidtion = (value, helper) => {
    const isValid = mongoose.isValidObjectId(value);
    if (!isValid) return helper.message('Invalid ID');

    return value;
}

export const generalRules = {
    _id: Joi.string().custom(objectValidtion)
}