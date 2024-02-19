import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {UsersRepository} from "../repositories/users-repository";

const validateLogin = body('login')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .isLength({min: 3, max: 10}).withMessage('Length must be from 3 to 10 symbols')
    .matches('^[a-zA-Z0-9_-]*$').withMessage('Field is incorrect')
    .custom(async login => {
        const user = await UsersRepository.findUserByLoginOrEmail(login)
        if (user) throw new Error()
    }).withMessage('User with such login already exists')

const validateEmail = body('email')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .isEmail().withMessage('Field is incorrect')
    .custom(async email => {
        const user = await UsersRepository.findUserByLoginOrEmail(email)
        if (user) throw new Error()
    }).withMessage('User with such email already exists')

const validatePassword = body('password')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .isLength({min: 6, max: 20}).withMessage('Length must be from 6 to 20 symbols')


export const userValidator = () => [validateLogin, validateEmail, validatePassword, inputValidationMiddleware]