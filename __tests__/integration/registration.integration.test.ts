import {MongoMemoryServer} from "mongodb-memory-server";
import {AuthService} from "../../src/services/auth-service";
import {testSeeder} from "../utils/test-seeder";
import {Result, StatusCode} from "../../src/utils/result";
import {nodemailerService} from "../../src/services/nodemailer-service";
import {sub} from "date-fns";
import {randomUUID} from "crypto";
import {ErrorsMessages, FieldError} from "../../src/utils/errors-messages";
import {SentMessageInfo} from "nodemailer";
import mongoose from "mongoose";
import {UserModel} from "../../src/repositories/models/user.model";


describe('REGISTRATION_INTEGRATION', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
    })

    beforeEach(async () => {
        await UserModel.deleteMany({})
        jest.clearAllMocks()
    });

    describe('user registration', () => {
        const registerUserUseCase = AuthService.registerUser
        const spy = jest.spyOn(nodemailerService, 'sendEmail').mockReturnValueOnce(Promise.resolve(true as SentMessageInfo))
        it('register user with correct data', async () => {
            const {login, email, password} = testSeeder.createUserDto()
            const result = await registerUserUseCase(login, email, password)
            expect(result).toEqual(new Result(StatusCode.NoContent))
            expect(spy).toBeCalledTimes(1)
        })
    })

    describe('code confirmation', () => {
        const confirmEmailByCodeUseCase = AuthService.confirmEmailByCode

        it('confirm user email by valid code', async () => {
            const {emailConfirmation} = await testSeeder.registerUser(testSeeder.createUserDto())
            const result = await confirmEmailByCodeUseCase(emailConfirmation.confirmationCode)
            expect(result).toEqual(new Result(StatusCode.NoContent))
        })

        it('failed confirmation because of the code is expired', async () => {
            const {emailConfirmation} = await testSeeder.registerUser({
                ...testSeeder.createUserDto(),
                expirationDate: sub(new Date(), {minutes: 30})
            })
            const result = await confirmEmailByCodeUseCase(emailConfirmation.confirmationCode)
            expect(result).toEqual(new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is expired'))
            ))
        })

        it('failed confirmation because of the code is already been applied', async () => {
            const {emailConfirmation} = await testSeeder.registerUser({
                ...testSeeder.createUserDto(),
                isConfirmed: true
            })
            const result = await confirmEmailByCodeUseCase(emailConfirmation.confirmationCode)
            expect(result).toEqual(new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is already been applied'))
            ))
        })

        it('failed confirmation because of the code is incorrect', async () => {
            const code = randomUUID()
            const result = await confirmEmailByCodeUseCase(code)
            expect(result).toEqual(new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is incorrect'))
            ))
        })
    })

    describe('resend confirmation code', () => {
        const resendConfirmationCodeUseCase = AuthService.resendConfirmationCode
        jest.spyOn(nodemailerService, 'sendEmail').mockReturnValueOnce(Promise.resolve(true as SentMessageInfo))

        it('resend confirmation code to user with invalid email', async () => {
            const result = await resendConfirmationCodeUseCase('invalid@gmail.com')
            expect(result).toEqual(new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('email', 'Email is incorrect'))
            ))
            expect(nodemailerService.sendEmail).not.toBeCalled()
        })

        it('resend confirmation code to the user with confirmed email', async () => {
            const {email} = await testSeeder.registerUser({
                ...testSeeder.createUserDto(),
                isConfirmed: true
            })
            const result = await resendConfirmationCodeUseCase(email)
            expect(result).toEqual(new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('email', 'Email is already confirmed'))
            ))
            expect(nodemailerService.sendEmail).not.toBeCalled()
        })

        it('resend confirmation code to user with valid email', async () => {
            const {email} = await testSeeder.registerUser(testSeeder.createUserDto())
            const result = await resendConfirmationCodeUseCase(email)
            expect(result).toEqual(new Result(StatusCode.NoContent))
            expect(nodemailerService.sendEmail).toBeCalledTimes(1)
        })
    })
})