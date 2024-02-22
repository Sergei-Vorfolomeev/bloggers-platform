import {app, PATHS} from "../../src/app";
import {nodemailerService} from "../../src/services/nodemailer-service";
import {MongoMemoryServer} from "mongodb-memory-server";
import {settings} from "../../src/settings";
import {client, usersCollection} from "../../src/db/db";

const request = require('supertest')

describe('AUTH-e2e', () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        settings.MONGO_URI = mongoServer.getUri()
        await usersCollection.deleteMany({})
    })

    afterAll(async () => {
        await client.close()
        await usersCollection.deleteMany({})
        jest.restoreAllMocks()
    })

    nodemailerService.sendEmail = jest.fn().mockImplementation(() => true)

    let user: any = null
    it('register user', async () => {
        await request(app)
            .post(`${PATHS.auth}/registration`)
            .send({
                login: 'test-login',
                email: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(204)
    })

    it('get registered user', async () => {
        const res = await request(app)
            .get(PATHS.users)
            .expect(200)
        user = res.body.items[0]
        expect(user).toEqual({
                id: expect.any(String),
                login: 'test-login',
                email: 'email@gmail.com',
                createdAt: expect.any(String),
            })
    })

    it('shouldn\'t create user twice', async () => {
        await request(app)
            .post(`${PATHS.auth}/registration`)
            .send({
                login: 'test-login',
                email: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(400, {
                errorsMessages: [
                    {
                        message: 'User with such login already exists',
                        field: 'login'
                    },
                    {
                        message: 'User with such email already exists',
                        field: 'email'
                    }
                ]
            })
    })

    let refreshToken: any = null
    it('login user', async () => {
        const res = await request(app)
            .post(`${PATHS.auth}/login`)
            .send({
                loginOrEmail: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(200)

        const cookieHeader = res.headers['set-cookie']
        refreshToken = cookieHeader[0].split(';')[0].split('=')[1]
        expect(refreshToken).toEqual(expect.any(String))
        expect(refreshToken).toContain('.')
        expect(res.body.accessToken).toEqual(expect.any(String))
        expect(res.body.accessToken).toContain('.')
    })

    it('refresh all tokens', async () => {
        const res = await request(app)
            .post(`${PATHS.auth}/refresh-token`)
            .set('Cookie', `token=${refreshToken}`)
            .expect(200)

        const cookieHeader = res.headers['set-cookie']
        refreshToken = cookieHeader[0].split(';')[0].split('=')[1]
        expect(refreshToken).toEqual(expect.any(String))
        expect(refreshToken).toContain('.')
        expect(res.body.accessToken).toEqual(expect.any(String))
        expect(res.body.accessToken).toContain('.')
    })

    it('logout', async () => {
        await request(app)
            .post(`${PATHS.auth}/logout`)
            .set('Cookie', `token=${refreshToken}`)
            .expect(204)
    })
})