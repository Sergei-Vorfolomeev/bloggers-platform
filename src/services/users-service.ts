import {UserDBModel} from "../repositories/types";
import {UsersRepository} from "../repositories/users-repository";
import {BcryptService} from "./bcrypt-service";
import {Result, StatusCode} from "../utils/result";

export class UsersService {
    static async createUser(login: string, email: string, password: string): Promise<Result<string>> {
        const hashedPassword = await BcryptService.generateHash(password)
        if (!hashedPassword) {
            return new Result(StatusCode.ServerError)
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
        }
        const createdUserId = await UsersRepository.createUser(newUser)
        if (!createdUserId) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Created, null, createdUserId)
    }

    static async deleteUser(id: string): Promise<Result> {
        const isDeleted = await UsersRepository.deleteUser(id)
        if (!isDeleted) {
            return new Result(StatusCode.NotFound)
        }
        return new Result(StatusCode.NoContent)
    }
}