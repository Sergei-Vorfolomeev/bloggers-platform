import {MongoMemoryServer} from "mongodb-memory-server";
import {settings} from "../../src/settings";
import {AuthService} from "../../src/services/auth-service";
import {testSeeder} from "../utils/testSeeder";
import {Result, StatusCode} from "../../src/utils/result";
import {client, usersCollection} from "../../src/db/db";
import {nodemailerService} from "../../src/services/nodemailer-service";


describe('AUTH-INTEGRATION', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        settings.MONGO_URI = mongoServer.getUri()
    })

    afterAll(async () => {
        await usersCollection.drop()
        await client.close()
    })

    describe('user registration', () => {
        const registerUserUseCase = AuthService.registerUser
        nodemailerService.sendEmail = jest.fn().mockImplementation((email: string, subject: string, message: string) => {
            return true
        })

        it('register user with correct data', async () => {
            const {login, email, password} = testSeeder.createUserDto()
            const result = await registerUserUseCase(login, email, password)
            expect(result).toEqual(new Result(StatusCode.NO_CONTENT))
            expect(nodemailerService.sendEmail).toBeCalledTimes(1)
        })
    })
})