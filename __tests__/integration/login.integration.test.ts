import {MongoMemoryServer} from "mongodb-memory-server";
import {settings} from "../../src/settings";
import {client, usersCollection} from "../../src/db/db";
import {testSeeder} from "../utils/testSeeder";
import {Result, StatusCode} from "../../src/utils/result";
import {ErrorsMessages, FieldError} from "../../src/utils/errors-messages";
import {AuthService} from "../../src/services/auth-service";

describe('LOGIN_INTEGRATION', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        settings.MONGO_URI = mongoServer.getUri()
        await usersCollection.deleteMany({})
    })

    afterAll(async () => {
        await usersCollection.deleteMany({})
        await client.close()
    })

    beforeEach(async () => {
        await usersCollection.deleteMany({})
    })

    describe('login user', () => {
        const checkUserCredentialsUseCase = AuthService.login

        it('login user with correct data', async () => {
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await checkUserCredentialsUseCase(user.email, user.password)
            expect(response).toEqual(new Result(StatusCode.SUCCESS, null, {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            }))
        })

        it('login user with incorrect email', async () => {
            const response = await checkUserCredentialsUseCase('invalid@gmail.com', '12345')
            expect(response).toEqual(new Result(
                StatusCode.UNAUTHORIZED,
                new ErrorsMessages(new FieldError('login, email, password', 'Login, email or password is incorrect'))))
        })

        it('login user with incorrect password', async () => {
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await checkUserCredentialsUseCase(user.email, 'invalid')
            expect(response).toEqual(new Result(
                StatusCode.UNAUTHORIZED,
                new ErrorsMessages(new FieldError('login, email, password', 'Login, email or password is incorrect'))))
        })

        it('login user with error in creating tokens', async () => {
            jest.spyOn(AuthService, 'generateTokens').mockReturnValueOnce(Promise.resolve(null));
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await checkUserCredentialsUseCase(user.email, user.password)
            expect(response).toEqual(new Result(StatusCode.SERVER_ERROR, 'Error with generating or saving tokens'))
        })
    })

    describe('update tokens', () => {
        const updateTokensUseCase = AuthService.updateTokens

        it('update the access token with a refresh token', async () => {
            const {refreshToken} = await testSeeder.loginUser()
            const result = await updateTokensUseCase(refreshToken)
            expect(result).toEqual(new Result(StatusCode.SUCCESS, null, {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
            }))
        })

        it('update the access token with incorrect refresh token ', async () => {
            await testSeeder.loginUser()
            const result = await updateTokensUseCase('invalid.token.provided')
            expect(result).toEqual(new Result(StatusCode.UNAUTHORIZED))
        })

        it('update the access token with expired refresh token ', async () => {
            const {refreshToken} = await testSeeder.loginUser()
            const result = await new Promise((resolve) => {
                setTimeout(async () => {
                    const res = await updateTokensUseCase(refreshToken)
                    resolve(res)
                }, 21000)
            })
            expect(result).toEqual(new Result(StatusCode.UNAUTHORIZED))
        })

        it('update the access token with error in generating tokens ', async () => {
            const {refreshToken} = await testSeeder.loginUser()
            jest.spyOn(AuthService, 'generateTokens').mockReturnValueOnce(Promise.resolve(null));
            const result = await new Promise((resolve) => {
                setTimeout(async () => {
                    const res = await updateTokensUseCase(refreshToken)
                    resolve(res)
                }, 2000)
            })
            expect(result).toEqual(new Result(StatusCode.SERVER_ERROR, 'Error with generating or saving tokens'))
        })
    })
})