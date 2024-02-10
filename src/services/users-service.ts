import {UserDBModel} from "../repositories/types";
import {UsersRepository} from "../repositories/users-repository";
import {UsersQueryRepository} from "../repositories/users-query-repository";

export class UsersService {
    static async checkUser(loginOrEmail: string, password: string) {

    }

    static async createUser(login: string, email: string, password: string) {
        const newUser: UserDBModel = {
            login, email, password,
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
}