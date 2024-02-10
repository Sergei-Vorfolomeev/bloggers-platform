import {body} from "express-validator";

export const validateLoginOrEmail = () => body('loginOrEmail')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('This field must be string')
    .isLength({min: 3, max: 30}).withMessage('Length must be from 3 to 30 symbols.')