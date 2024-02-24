import {MongoMemoryServer} from "mongodb-memory-server";
import {settings} from "../../src/settings";
import {client, devicesCollection, usersCollection} from "../../src/db/db";
import {userSeeder} from "../utils/user-seeder";
import {app, PATHS} from "../../src/app";
import {nodemailerService} from "../../src/services/nodemailer-service";
import {SentMessageInfo} from "nodemailer";

const request = require('supertest')

describe('devices', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        settings.MONGO_URI = mongoServer.getUri()
    })

    afterAll(async () => {
        await usersCollection.deleteMany({})
        await devicesCollection.deleteMany({})
        await client.close()
    })

    jest.spyOn(nodemailerService, 'sendEmail').mockReturnValueOnce(Promise.resolve(true as SentMessageInfo))

    it('get all user devices', async () => {
        const user = await userSeeder.registerUser(app)
        const tokens1 = await userSeeder.loginUserWithUserAgent(app, user.email, user.password, 'Chrome')
        const tokens2 = await userSeeder.loginUserWithUserAgent(app, user.email, user.password, 'Safari')
        const tokens3 = await userSeeder.loginUserWithUserAgent(app, user.email, user.password, 'IPhone')
        const tokens4 = await userSeeder.loginUserWithUserAgent(app, user.email, user.password, 'Android1')

        const res = await request(app)
            .get(PATHS.devices)
            .set('Cookie', `refreshToken=${tokens4.refreshToken}`)
            .expect(200)

        expect(res.body).toEqual([
            {
                deviceId: expect.any(String),
                title: expect.any(String),
                ip: expect.any(String),
                lastActivateDate: expect.any(String),
            },
            {
                deviceId: expect.any(String),
                title: expect.any(String),
                ip: expect.any(String),
                lastActivateDate: expect.any(String),
            },
            {
                deviceId: expect.any(String),
                title: expect.any(String),
                ip: expect.any(String),
                lastActivateDate: expect.any(String),
            },
            {
                deviceId: expect.any(String),
                title: expect.any(String),
                ip: expect.any(String),
                lastActivateDate: expect.any(String),
            },
        ])
    })
})