// Utils
import { ApiError } from "../Utils/index.js";
// Middlewares
import { catchError } from "./error/catch-error.middleware.js"

/**
 * Middleware function that checks if a document with a specific field value already exists in the database.
 *
 * @param {Object} model - The Mongoose model to query.
 * @param {string} fieldName - The name of the field to check for existence.
 * @return {Function} - The middleware function that checks for document existence.
 */
const checkIsExist = (model, fieldName) => {
    return catchError(async (req, res, next) => {
        const value = req.body?.[fieldName]; // Access the field dynamically

        if (value) {
            const queryObject = { [fieldName]: value };
            const document = await model.findOne(queryObject);
            if (document) return next(new ApiError(`A document with the ${fieldName}: ${value} already exists in ${model.modelName}.`, 400))
        }

        next();
    });
};


/**
 * Middleware function that checks if a document with specific field values does not exist in the database.
 *
 * @param {Object} model - The Mongoose model to query.
 * @param {Array} fields - An array of field names to check for existence. Defaults to ["_id"].
 * @param {Object} populationOpt - Optional population options for the query.
 * @return {Function} - The middleware function that checks for document non-existence.
 */
const checkIsNotExist = (model, fields = ["_id"], populationOpt) => {
    return catchError(async (req, res, next) => {
        let queryObject = {};

        for (const field of fields) {
            queryObject[field] = req.query[field] || req.params[field];
        };

        // 1- Buld Query
        const query = model.findOne(queryObject);

        if (populationOpt) {
            query.populate(populationOpt)
        }

        // 2- Execute Query
        const document = await query;
        if (!document) return next(new ApiError(`This document is not exists in ${model.modelName}.`, 404))

        // Attach the found document to the request object
        req.document = document;
        next();
    });

};




export {
    checkIsExist,
    checkIsNotExist
}