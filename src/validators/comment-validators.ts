import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";

const validateContent = body('content')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be a string')
    .isLength({min: 20, max: 300}).withMessage('Length must be from 20 to 300 symbols')

export const validateLikeStatus = body('likeStatus')
    .notEmpty().withMessage('Field is required')
    .isIn(['Like', 'Dislike', 'None']).withMessage('Like status is incorrect')

export const commentValidators = () => [validateContent, inputValidationMiddleware]
export const likeStatusValidator = () => [validateLikeStatus, inputValidationMiddleware]