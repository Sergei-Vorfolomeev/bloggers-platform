import {UserDBModel} from "../repositories/types";
import {UsersRepository} from "../repositories/users-repository";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {BcryptService} from "./bcrypt-service";
import {TokensPayload, UserViewModel} from "./types";
import {JwtService} from "./jwt-service";
import {WithId} from "mongodb";
import {Result, StatusCode} from "../utils/result";
import {ErrorsMessages, FieldError} from "../utils/errors-messages";

export class UsersService {
    static async checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<TokensPayload>> {
        const user = await UsersRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return new Result(
                StatusCode.UNAUTHORIZED,
                new ErrorsMessages(
                    new FieldError('login, email', 'Login or email is incorrect')
                )
            )
        }
        const isMatched = await BcryptService.comparePasswords(password, user.password)
        if (!isMatched) {
            return new Result(
                StatusCode.UNAUTHORIZED,
                new ErrorsMessages(
                    new FieldError('password', 'Password is incorrect')
                )
            )
        }
        const tokens = await UsersService.generateTokens(user)
        if (!tokens) {
            return new Result(StatusCode.SERVER_ERROR, 'Error with generating or saving tokens')
        }
        return new Result(StatusCode.SUCCESS, null, tokens)
    }

    static async createUser(login: string, email: string, password: string): Promise<UserViewModel | null> {
        const hashedPassword = await BcryptService.generateHash(password)
        if (!hashedPassword) {
            return null
        }
        const newUser: UserDBModel = {
            login, email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: '',
                expirationDate: new Date(),
                isConfirmed: true
            },
            refreshToken: null
        }
        const createdUserId = await UsersRepository.createUser(newUser)
        if (!createdUserId) {
            return null
        }
        const createdUser = await UsersQueryRepository.getUserById(createdUserId)
        if (!createdUser) {
            return null
        }
        return createdUser
    }

    static async deleteUser(id: string): Promise<boolean> {
        return await UsersRepository.deleteUser(id)
    }

    static async generateTokens(user: WithId<UserDBModel>): Promise<TokensPayload | null> {
        const accessToken = JwtService.createToken(user, 'access')
        const refreshToken = JwtService.createToken(user, 'refresh')
        const refreshTokenHash = await BcryptService.generateHash(refreshToken)
        if (!refreshTokenHash) {
            return null
        }
        const isSaved = await UsersRepository.saveRefreshToken(user._id, refreshTokenHash)
        if (!isSaved) {
            return null
        }
        return {accessToken: accessToken, refreshToken: refreshToken}
    }
}