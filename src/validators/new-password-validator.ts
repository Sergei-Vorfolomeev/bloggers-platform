import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";

const validatePassword = body('password')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .isLength({min: 6, max: 20}).withMessage('Length must be from 6 to 20 symbols')

const validateRecoveryCode = body('password')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')

export const newPasswordValidators = () => [validatePassword, validateRecoveryCode, inputValidationMiddleware]