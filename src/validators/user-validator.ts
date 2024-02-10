import {body} from "express-validator";

const validateLogin = body('login')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .isLength({min: 3, max: 10}).withMessage('Length must be from 3 to 10 symbols')
    .matches('^[a-zA-Z0-9_-]*$').withMessage('Field is incorrect')
    // .custom(value => {
    //     await
    // })

const validateEmail = body('email')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$\n').withMessage('Field is incorrect')

const validatePassword = body('password')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .isLength({min: 6, max: 20}).withMessage('Length must be from 6 to 20 symbols')


export const userValidator = () => [validateLogin, validateEmail, validatePassword]