import {MongoMemoryServer} from "mongodb-memory-server";
import {testSeeder} from "../utils/test-seeder";
import {Result, StatusCode} from "../../src/utils/result";
import {UserModel} from "../../src/db/mongoose/models/user.model";
import mongoose from "mongoose";
import {authService} from "../../src/composition-root";

describe('LOGOUT_INTEGRATION', () => {
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

    const logoutUseCase = authService.logout.bind(authService)

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