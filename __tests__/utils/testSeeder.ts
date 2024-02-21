import {UserDBModel} from "../../src/repositories/types";
import {randomUUID} from "crypto";
import {add} from "date-fns/add";
import {usersCollection} from "../../src/db/db";
import {BcryptService} from "../../src/services/bcrypt-service";
import {AuthService} from "../../src/services/auth-service";

type RegisterUserDtoType = {
    login: string
    email: string
    password: string
    code?: string
    expirationDate?: Date
    isConfirmed?: boolean
    refreshToken?: string
}

export const testSeeder = {
    createUserDto() {
        const random = Math.floor(Math.random() * 1000)
        return {
            login: `test${random}`,
            email: `test${random}@gmail.com`,
            password: 'test-pass',
        }
    },
    async registerUser({
                           login,
                           email,
                           password,
                           code,
                           expirationDate,
                           isConfirmed,
                           refreshToken
                       }: RegisterUserDtoType
    ) {
        const hashedPassword = await BcryptService.generateHash(password)
        if (!hashedPassword) {
            throw new Error('error with bcrypt hashing password in testSeeder')
        }
        const newUser: UserDBModel = {
            login,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: code ?? randomUUID(),
                expirationDate: expirationDate ?? add(new Date(), {minutes: 30}),
                isConfirmed: isConfirmed ?? false
            },
            refreshToken: refreshToken ?? null
        }
        const res = await usersCollection.insertOne(newUser)
        return {
            id: res.insertedId.toString(),
            ...newUser,
            password: password,
        }
    },
    async loginUser() {
        const user = await testSeeder.registerUser(testSeeder.createUserDto())
        const response = await AuthService.login(user.email, user.password)
        return {
            email: user.email,
            login: user.login,
            password: user.password,
            accessToken: response.data!.accessToken,
            refreshToken: response.data!.refreshToken,
        }
    }
}