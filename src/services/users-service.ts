import {UserDBModel} from "../repositories/types";
import {UsersRepository} from "../repositories/users-repository";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {BcryptService} from "./bcrypt-service";

export class UsersService {
    static async checkUser(loginOrEmail: string, password: string): Promise<boolean> {
        const user = await UsersQueryRepository.getUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return false
        }
        return await BcryptService.compareHash(password, user.password)
    }

    static async createUser(login: string, email: string, password: string) {
        const hashedPassword = await BcryptService.generateHash(password)
        const newUser: UserDBModel = {
            login, email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
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