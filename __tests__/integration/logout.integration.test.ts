import {MongoMemoryServer} from "mongodb-memory-server";
import {settings} from "../../src/settings";
import {client, usersCollection} from "../../src/db/db";
import {testSeeder} from "../utils/test-seeder";
import {AuthService} from "../../src/services/auth-service";
import {Result, StatusCode} from "../../src/utils/result";

describe('LOGOUT_INTEGRATION', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        settings.MONGO_URI = mongoServer.getUri()
    })

    afterAll(async () => {
        await usersCollection.deleteMany({})
        await client.close()
    })

    beforeEach(async () => {
        await usersCollection.deleteMany({})
    })

    const logoutUseCase = AuthService.logout

    it('successful logout', async () => {
        const {refreshToken} = await testSeeder.loginUser()
        const result = await logoutUseCase(refreshToken)
        expect(result).toEqual(new Result(StatusCode.NoContent))
    })

    it('logout with invalid refresh token', async () => {
        await testSeeder.loginUser()
        const result = await logoutUseCase('invalid.refresh.token')
        expect(result).toEqual(new Result(StatusCode.Unauthorized))
    })

    it('logout with expired refresh token', async () => {
        const {refreshToken} = await testSeeder.loginUser()
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(1)
            }, 21000)
        })
        const result = await logoutUseCase(refreshToken)
        expect(result).toEqual(new Result(StatusCode.Unauthorized))
    })
})