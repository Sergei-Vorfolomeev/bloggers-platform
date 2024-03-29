import {body} from "express-validator";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {UsersRepository} from "../repositories";

const usersRepository = new UsersRepository()

const validatePassword = body('newPassword')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .isLength({min: 6, max: 20}).withMessage('Length must be from 6 to 20 symbols')
debugger

const validateRecoveryCode = body('recoveryCode')
    .notEmpty().withMessage('Field is required')
    .isString().trim().withMessage('Field must be string')
    .custom(async recoveryCode => {
        const user = await usersRepository.findUserByRecoveryCode(recoveryCode)
        if (!user) throw new Error
    }).withMessage('Incorrect recovery code')

export const newPasswordValidators = () => [validatePassword, validateRecoveryCode, inputValidationMiddleware]