import {UserDBModel} from "../../src/repositories/types";
import {randomUUID} from "crypto";
import {add} from "date-fns/add";
import {BcryptService} from "../../src/services/bcrypt-service";
import {AuthService} from "../../src/services/auth-service";
import {UserModel} from "../../src/repositories/models/user.model";

type RegisterUserDtoType = {
    login: string
    email: string
    password: string
    code?: string
    expirationDate?: Date
    isConfirmed?: boolean
    refreshToken?: string
    recoveryCode? : string
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
                           recoveryCode
                       }: RegisterUserDtoType
    ) {
        const hashedPassword = await BcryptService.generateHash(password)
        if (!hashedPassword) {
            throw new Error('error with bcrypt hashing password in testSeeder')
        }
        const newUserDto: UserDBModel = {
            login,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: code ?? randomUUID(),
                expirationDate: expirationDate ?? add(new Date(), {minutes: 30}),
                isConfirmed: isConfirmed ?? false
            },
            passwordRecovery: {
                recoveryCode: recoveryCode ?? randomUUID()
            }
        }
        const newUser = new UserModel(newUserDto)
        await newUser.save()
        return {
            id: newUser._id.toString(),
            ...newUserDto,
            password: password,
        }
    },
    async loginUser() {
        const devices = ['Chrome', 'Safari', 'Mozilla', 'Tor', 'Iphone', 'MacOS', 'Linux', 'Android']
        const randomIndex = Math.floor(Math.random() * 8)
        const user = await testSeeder.registerUser(testSeeder.createUserDto())
        const response = await AuthService.login(user.email, user.password, devices[randomIndex], this.generateIp())
        return {
            email: user.email,
            login: user.login,
            password: user.password,
            accessToken: response.data!.accessToken,
            refreshToken: response.data!.refreshToken,
        }
    },

    generateIp() {
        let ip = ''
        for (let i = 0; i < 4; i++) {
            const random = Math.floor(Math.random() * 256)
            ip += `${random}.`
        }
        return ip.substring(0, ip.length - 1)
    }
}