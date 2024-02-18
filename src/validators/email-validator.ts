import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";

const validateEmail = body('email')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be a string')
    .isEmail().withMessage('Incorrect email')

export const emailValidator = () => [validateEmail, inputValidationMiddleware]