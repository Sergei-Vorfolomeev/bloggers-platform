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
}