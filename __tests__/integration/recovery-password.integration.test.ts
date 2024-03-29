import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {testSeeder} from "../utils/test-seeder";
import {Result, StatusCode} from "../../src/utils/result";
import {SentMessageInfo} from "nodemailer";
import {UserModel} from "../../src/db/mongoose/models/user.model";
import {authService, nodemailerService} from "../../src/composition-root";

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
        const recoveryPasswordUseCase = authService.recoverPassword.bind(authService)
        const spy = jest.spyOn(nodemailerService, 'sendEmail').mockReturnValue(Promise.resolve(true as SentMessageInfo))

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
        const recoveryPasswordUseCase = authService.updatePassword.bind(authService)

        it('successful updating password', async () => {
            const {passwordRecovery} = await testSeeder.registerUser(testSeeder.createUserDto())
            const result = await recoveryPasswordUseCase(passwordRecovery?.recoveryCode as string, 'newPassword')
            expect(result).toEqual(new Result(StatusCode.NoContent))
        })

        it('update password with invalid recovery code', async () => {
            await testSeeder.registerUser(testSeeder.createUserDto())
            const result = await recoveryPasswordUseCase('invalid code', 'newPassword')
            expect(result).toEqual(new Result(StatusCode.BadRequest))
        })
    })
})