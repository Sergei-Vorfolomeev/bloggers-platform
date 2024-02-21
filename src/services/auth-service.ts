import {BcryptService} from "./bcrypt-service";
import {UserDBModel} from "../repositories/types";
import {randomUUID} from "crypto";
import {add} from "date-fns/add";
import {UsersRepository} from "../repositories/users-repository";
import {Result, StatusCode} from "../utils/result";
import {nodemailerService} from "./nodemailer-service";
import {template} from "../utils/template";
import {ErrorsMessages, FieldError} from "../utils/errors-messages";

export class AuthService {
    static async registerUser(login: string, email: string, password: string): Promise<Result> {
        const hashedPassword = await BcryptService.generateHash(password)
        if (!hashedPassword) {
            return new Result(StatusCode.SERVER_ERROR, 'Error with hashing password')
        }
        const newUser: UserDBModel = {
            login,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }),
                isConfirmed: false
            },
            refreshToken: null
        }
        const userId = await UsersRepository.createUser(newUser)
        if (!userId) {
            return new Result(StatusCode.SERVER_ERROR, 'Error with creating user in db')
        }
        const info = await nodemailerService.sendEmail(email, 'Confirm your email', template(newUser.emailConfirmation.confirmationCode))
        if (!info) {
            return new Result(StatusCode.SERVER_ERROR, 'Error with sending email')
        }
        return new Result(StatusCode.NO_CONTENT)
    }

    static async confirmEmailByCode(code: string): Promise<Result> {
        const user = await UsersRepository.findByConfirmationCode(code)
        if (!user) {
            return new Result(
                StatusCode.BAD_REQUEST,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is incorrect'))
            )
        }
        if (user.emailConfirmation.isConfirmed) {
            return new Result(
                StatusCode.BAD_REQUEST,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is already been applied'))
            )
        }
        if (new Date() > user.emailConfirmation.expirationDate) {
            return new Result(
                StatusCode.BAD_REQUEST,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is expired'))
            )
        }
        const isUpdated = await UsersRepository.confirmEmail(user._id)
        if (!isUpdated) {
            return new Result(
                StatusCode.SERVER_ERROR,
                new ErrorsMessages(new FieldError('code', 'Confirmation code wasn\'t updated'))
            )
        }
        return new Result(StatusCode.NO_CONTENT)
    }

    static async resendConfirmationCode(email: string) {
        const user = await UsersRepository.findUserByLoginOrEmail(email)
        if (!user) {
            return new Result(
                StatusCode.BAD_REQUEST,
                new ErrorsMessages(new FieldError('email', 'Email is incorrect'))
            )
        }
        if (user.emailConfirmation.isConfirmed) {
            return new Result(
                StatusCode.BAD_REQUEST,
                new ErrorsMessages(new FieldError('email', 'Email is already confirmed'))
            )
        }
        const newCode = randomUUID()
        const info = await nodemailerService.sendEmail(email, 'Confirm your email', template(newCode))
        if (!info) {
            return new Result(
                StatusCode.SERVER_ERROR,
                new ErrorsMessages(new FieldError('email', 'Error with sending email'))
            )
        }
        const isUpdated = await UsersRepository.updateConfirmationCode(user._id, newCode)
        if (!isUpdated) {
            return new Result(
                StatusCode.SERVER_ERROR,
                new ErrorsMessages(new FieldError('code', 'Confirmation code wasn\'t updated'))
            )
        }
        return new Result(StatusCode.NO_CONTENT)
    }

    static async updateTokens(refreshToken: string) {
        const user = await UsersRepository.findUserByRefreshToken(refreshToken)
        if (!user) {
            return new Result(StatusCode.UNAUTHORIZED)
        }
    }
}