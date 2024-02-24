import {BcryptService} from "./bcrypt-service";
import {UserDBModel} from "../repositories/types";
import {randomUUID} from "crypto";
import {add} from "date-fns/add";
import {UsersRepository} from "../repositories/users-repository";
import {Result, StatusCode} from "../utils/result";
import {nodemailerService} from "./nodemailer-service";
import {template} from "../utils/template";
import {ErrorsMessages, FieldError} from "../utils/errors-messages";
import {TokensPayload} from "./types";
import {JwtService} from "./jwt-service";
import {WithId} from "mongodb";
import {CryptoService} from "./crypto-service";

export class AuthService {
    static async registerUser(login: string, email: string, password: string): Promise<Result> {
        const hashedPassword = await BcryptService.generateHash(password)
        if (!hashedPassword) {
            return new Result(StatusCode.ServerError, 'Error with hashing password')
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
            return new Result(StatusCode.ServerError, 'Error with creating user in db')
        }
        const info = await nodemailerService.sendEmail(email, 'Confirm your email', template(newUser.emailConfirmation.confirmationCode))
        if (!info) {
            return new Result(StatusCode.ServerError, 'Error with sending email')
        }
        return new Result(StatusCode.NoContent)
    }

    static async confirmEmailByCode(code: string): Promise<Result> {
        const user = await UsersRepository.findByConfirmationCode(code)
        if (!user) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is incorrect'))
            )
        }
        if (user.emailConfirmation.isConfirmed) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is already been applied'))
            )
        }
        if (new Date() > user.emailConfirmation.expirationDate) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is expired'))
            )
        }
        const isUpdated = await UsersRepository.confirmEmail(user._id)
        if (!isUpdated) {
            return new Result(
                StatusCode.ServerError,
                new ErrorsMessages(new FieldError('code', 'Confirmation code wasn\'t updated'))
            )
        }
        return new Result(StatusCode.NoContent)
    }

    static async resendConfirmationCode(email: string) {
        const user = await UsersRepository.findUserByLoginOrEmail(email)
        if (!user) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('email', 'Email is incorrect'))
            )
        }
        if (user.emailConfirmation.isConfirmed) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('email', 'Email is already confirmed'))
            )
        }
        const newCode = randomUUID()
        const info = await nodemailerService.sendEmail(email, 'Confirm your email', template(newCode))
        if (!info) {
            return new Result(
                StatusCode.ServerError,
                new ErrorsMessages(new FieldError('email', 'Error with sending email'))
            )
        }
        const isUpdated = await UsersRepository.updateConfirmationCode(user._id, newCode)
        if (!isUpdated) {
            return new Result(
                StatusCode.ServerError,
                new ErrorsMessages(new FieldError('code', 'Confirmation code wasn\'t updated'))
            )
        }
        return new Result(StatusCode.NoContent)
    }

    static async login(loginOrEmail: string, password: string): Promise<Result<TokensPayload>> {
        const user = await UsersRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return new Result(
                StatusCode.Unauthorized,
                new ErrorsMessages(
                    new FieldError('login, email, password', 'Login, email or password is incorrect')
                )
            )
        }
        const isMatched = await BcryptService.comparePasswords(password, user.password)
        if (!isMatched) {
            return new Result(
                StatusCode.Unauthorized,
                new ErrorsMessages(
                    new FieldError('login, email, password', 'Login, email or password is incorrect')
                )
            )
        }
        const tokens = await AuthService.generateTokens(user)
        if (!tokens) {
            return new Result(StatusCode.ServerError, 'Error with generating or saving tokens')
        }
        return new Result(StatusCode.Success, null, tokens)
    }

    static async generateTokens(user: WithId<UserDBModel>): Promise<TokensPayload | null> {
        const accessToken = JwtService.createToken(user, 'access')
        const refreshToken = JwtService.createToken(user, 'refresh')
        const encryptedToken = CryptoService.encrypt(refreshToken)
        const isSaved = await UsersRepository.saveRefreshToken(user._id, encryptedToken)
        if (!isSaved) {
            return null
        }
        return {accessToken, refreshToken}
    }

    static async updateTokens(refreshToken: string): Promise<Result<TokensPayload>> {
        const user = await AuthService.findUserByRefreshToken(refreshToken)
        if (!user) {
            return new Result(StatusCode.Unauthorized)
        }
        const tokens = await AuthService.generateTokens(user)
        if (!tokens) {
            return new Result(StatusCode.ServerError, 'Error with generating or saving tokens')
        }
        return new Result(StatusCode.Success, null, tokens)
    }

    static async findUserByRefreshToken(refreshToken: string): Promise<WithId<UserDBModel> | null> {
        const payload = await JwtService.verifyToken(refreshToken, 'refresh')
        if (!payload) {
            return null
        }
        const user = await UsersRepository.findUserByUserId(payload.userId)
        if (!user || !user.refreshToken) {
            return null
        }
        const decryptedRefreshToken = CryptoService.decrypt(user.refreshToken)
        const isMatched = refreshToken === decryptedRefreshToken
        if (!isMatched) {
            return null
        }
        return user
    }

    static async logout(refreshToken: string): Promise<Result> {
        const user = await AuthService.findUserByRefreshToken(refreshToken)
        if (!user) {
            return new Result(StatusCode.Unauthorized)
        }
        const isSaved = await UsersRepository.saveRefreshToken(user._id, null)
        if (!isSaved) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }
}