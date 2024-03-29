import {MongoMemoryServer} from "mongodb-memory-server";
import {testSeeder} from "../utils/test-seeder";
import {Result, StatusCode} from "../../src/utils/result";
import {ErrorsMessages, FieldError} from "../../src/utils/errors-messages";
import mongoose from "mongoose";
import {UserModel} from "../../src/db/mongoose/models/user.model";
import {authService} from "../../src/composition-root";

describe('LOGIN_INTEGRATION', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
    })

    beforeEach(async () => {
        await UserModel.deleteMany({})
    })


    describe('login user', () => {
        const loginUseCase = authService.login.bind(authService)

        it('login user with correct data', async () => {
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await loginUseCase(user.email, user.password, 'Chrome', '1.1.1.1')
            expect(response).toEqual(new Result(StatusCode.Success, null, {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            }))
        })

        it('login user with incorrect email', async () => {
            const response = await loginUseCase('invalid@gmail.com', '12345', 'Chrome', '1.1.1.1')
            expect(response).toEqual(new Result(
                StatusCode.Unauthorized,
                new ErrorsMessages(new FieldError('login, email, password', 'Login, email or password is incorrect'))))
        })

        it('login user with incorrect password', async () => {
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await loginUseCase(user.email, 'invalid', 'Chrome', '1.1.1.1')
            expect(response).toEqual(new Result(
                StatusCode.Unauthorized,
                new ErrorsMessages(new FieldError('login, email, password', 'Login, email or password is incorrect'))))
        })

        it('login user with error in creating tokens', async () => {
            jest.spyOn(authService, 'generateTokens').mockReturnValueOnce(Promise.resolve(null));
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await loginUseCase(user.email, user.password, 'Chrome', '1.1.1.1')
            expect(response).toEqual(new Result(StatusCode.ServerError, 'Error with generating or saving tokens'))
        })
    })

    describe('update tokens', () => {
        const updateTokensUseCase = authService.updateTokens.bind(authService)

        it('update the access and refresh token', async () => {
            const {refreshToken} = await testSeeder.loginUser()
            const result = await updateTokensUseCase(refreshToken)
            expect(result).toEqual(new Result(StatusCode.Success, null, {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            }))
        })

        it('update the access token with incorrect refresh token ', async () => {
            await testSeeder.loginUser()
            const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWRhMTNmOGMxMTgzZTQ5MGYxOGIwZDciLCJkZXZpY2VJZCI6IjY1ZGExNDIwYzExODNlNDkwZjE4YjBkOCIsImlhdCI6MTcwODc5MDgxNiwiZXhwIjoxNzA4NzkwODI2fQ.V6awo096BO88xopUcaXgZ3tU66soo7cCnQMvRczAm70'
            const result = await updateTokensUseCase(invalidToken)
            expect(result).toEqual(new Result(StatusCode.Unauthorized))
        })

        it('update the access token with expired refresh token ', async () => {
            const {refreshToken} = await testSeeder.loginUser()
            const result = await new Promise((resolve) => {
                setTimeout(async () => {
                    const res = await updateTokensUseCase(refreshToken)
                    resolve(res)
                }, 21000)
            })
            expect(result).toEqual(new Result(StatusCode.Unauthorized))
        })

        it('update the access token with error in generating tokens ', async () => {
            const {refreshToken} = await testSeeder.loginUser()
            jest.spyOn(authService, 'generateTokens').mockReturnValueOnce(Promise.resolve(null));
            const result = await new Promise((resolve) => {
                setTimeout(async () => {
                    const res = await updateTokensUseCase(refreshToken)
                    resolve(res)
                }, 2000)
            })
            expect(result).toEqual(new Result(StatusCode.ServerError, ))
        })
    })
})