import {MongoMemoryServer} from "mongodb-memory-server";
import {settings} from "../../src/settings";
import {client, usersCollection} from "../../src/db/db";
import {UsersService} from "../../src/services/users-service";
import {testSeeder} from "../utils/testSeeder";
import {Result, StatusCode} from "../../src/utils/result";
import {ErrorsMessages, FieldError} from "../../src/utils/errors-messages";

describe('LOGIN-INTEGRATION', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        settings.MONGO_URI = mongoServer.getUri()
    })

    afterAll(async () => {
        await usersCollection.drop()
        await client.close()
    })

    describe('login user', () => {
        const checkUserCredentialsUseCase = UsersService.checkUserCredentials

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
                new ErrorsMessages(new FieldError('login, email', 'Login or email is incorrect'))))
        })

        it('login user with incorrect password', async () => {
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await checkUserCredentialsUseCase(user.email, 'invalid')
            expect(response).toEqual(new Result(
                StatusCode.UNAUTHORIZED,
                new ErrorsMessages(new FieldError('password', 'Password is incorrect'))))
        })

        it('login user with incorrect password', async () => {
            UsersService.generateTokens = jest.fn().mockImplementation(() => false)
            const user = await testSeeder.registerUser(testSeeder.createUserDto())
            const response = await checkUserCredentialsUseCase(user.email, user.password)
            expect(response).toEqual(new Result(StatusCode.SERVER_ERROR, 'Error with generating or saving tokens'))
        })
    })
})