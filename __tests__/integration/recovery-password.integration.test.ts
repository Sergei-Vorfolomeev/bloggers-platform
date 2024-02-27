import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {AuthService} from "../../src/services/auth-service";
import {testSeeder} from "../utils/test-seeder";
import {Result, StatusCode} from "../../src/utils/result";
import {NodemailerService} from "../../src/services/nodemailer-service";
import {SentMessageInfo} from "nodemailer";
import {UserModel} from "../../src/repositories/models/user.model";

describe('RECOVERY_PASSWORD_INTEGRATION', () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
    })

    afterEach(async () => {
        await UserModel.deleteMany({})
        jest.resetAllMocks()
    })

    describe('recovery password', () => {
        const recoveryPasswordUseCase = AuthService.recoverPassword
        const spy = jest.spyOn(NodemailerService, 'sendEmail').mockReturnValue(Promise.resolve(true as SentMessageInfo))

        it('successful sending code', async () => {
            const {email} = await testSeeder.registerUser(testSeeder.createUserDto())
            const result = await recoveryPasswordUseCase(email)
            expect(result).toEqual(new Result(StatusCode.NoContent))
            expect(spy).toHaveBeenCalledTimes(1)
        })

        it('pass wrong email', async () => {
            const result = await recoveryPasswordUseCase('wrongEmail@gmail.com')
            expect(result).toEqual(new Result(StatusCode.NoContent))
            expect(spy).toHaveBeenCalledTimes(0)
        })
    })

    describe('pass new password', () => {
        const recoveryPasswordUseCase = AuthService.updatePassword

        it('successful updating password', async () => {
            const {passwordRecovery} = await testSeeder.registerUser(testSeeder.createUserDto())
            const result = await recoveryPasswordUseCase(passwordRecovery?.recoveryCode as string, 'newPassword')
            expect(result).toEqual(new Result(StatusCode.NoContent))
        })

        it('update password with invalid recovery code', async () => {
            const {passwordRecovery} = await testSeeder.registerUser(testSeeder.createUserDto())
            const result = await recoveryPasswordUseCase('invalid code', 'newPassword')
            expect(result).toEqual(new Result(StatusCode.BadRequest))
        })
    })
})