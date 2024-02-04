import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";

const validateName = body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name should be string')
    .isLength({max: 15}).withMessage('Length should be max 15 symbols')

const validateDescription = body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description should be string')
    .isLength({max: 500}).withMessage('Length should be max 500 symbols')

const validateWebsiteUrl = body('websiteUrl')
    .trim()
    .notEmpty().withMessage('WebsiteUrl is required')
    .isString().withMessage('WebsiteUrl should be string')
    .isLength({max: 100}).withMessage('Length should be max 100 symbols')
    .isURL().withMessage('Incorrect URL')

export const blogValidators = () => [validateName, validateDescription, validateWebsiteUrl, inputValidationMiddleware]