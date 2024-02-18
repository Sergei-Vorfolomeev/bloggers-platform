import {UserDBModel} from "../../src/repositories/types";
import {randomUUID} from "crypto";
import {add} from "date-fns/add";
import {usersCollection} from "../../src/db/db";

type RegisterUserDtoType = {
    login: string
    email: string
    password: string
    code?: string
    expirationDate?: Date
    isConfirmed?: boolean
}

export const testSeeder = {
    createUserDto() {
        return {
            login: 'test',
            email: 'test@gmail.com',
            password: 'test-pass',
        }
    },
    async registerUser({
                           login,
                           email,
                           password,
                           code,
                           expirationDate,
                           isConfirmed
                       }: RegisterUserDtoType
    ) {
        const newUser: UserDBModel = {
            login,
            email,
            password,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: code ?? randomUUID(),
                expirationDate: expirationDate ?? add(new Date(), {minutes: 30}),
                isConfirmed: isConfirmed ?? false
            }
        }
        const res = await usersCollection.insertOne(newUser)
        return {
            id: res.insertedId.toString(),
            ...newUser
        }
    }
}