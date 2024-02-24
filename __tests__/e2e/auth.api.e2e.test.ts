import {app, PATHS} from "../../src/app";
import {nodemailerService} from "../../src/services/nodemailer-service";
import {MongoMemoryServer} from "mongodb-memory-server";
import {settings} from "../../src/settings";
import {client, usersCollection} from "../../src/db/db";
import {SentMessageInfo} from "nodemailer";

const request = require('supertest')

describe('AUTH-e2e', () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        settings.MONGO_URI = mongoServer.getUri()
        await usersCollection.deleteMany({})
    })

    afterAll(async () => {
        await usersCollection.deleteMany({})
        jest.restoreAllMocks()
        await client.close()
    })

    jest.spyOn(nodemailerService, 'sendEmail').mockReturnValueOnce(Promise.resolve(true as SentMessageInfo))

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

    let validRefreshToken: any = null
    let inValidRefreshToken: any = null
    it('login user', async () => {
        const res = await request(app)
            .post(`${PATHS.auth}/login`)
            .send({
                loginOrEmail: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(200)

        const cookieHeader = res.headers['set-cookie']
        validRefreshToken = cookieHeader[0].split(';')[0].split('=')[1]
        expect(validRefreshToken).toEqual(expect.any(String))
        expect(validRefreshToken).toContain('.')
        expect(res.body.accessToken).toEqual(expect.any(String))
        expect(res.body.accessToken).toContain('.')
        await new Promise(resolve => {
            setTimeout(() => {
                resolve(1)
            }, 500)
        })
    })

    it('refresh all tokens', async () => {
        const res = await request(app)
            .post(`${PATHS.auth}/refresh-token`)
            .set('Cookie', `refreshToken=${validRefreshToken}`)
            .expect(200)

        inValidRefreshToken = validRefreshToken
        const cookieHeader = res.headers['set-cookie']
        validRefreshToken = cookieHeader[0].split(';')[0].split('=')[1]
        expect(validRefreshToken).toEqual(expect.any(String))
        expect(validRefreshToken).toContain('.')
        expect(validRefreshToken).not.toBe(inValidRefreshToken)
        expect(res.body.accessToken).toEqual(expect.any(String))
        expect(res.body.accessToken).toContain('.')
    })


    it('refresh all tokens with invalid refresh token', async () => {
        await request(app)
            .post(`${PATHS.auth}/refresh-token`)
            .set('Cookie', `refreshToken=${inValidRefreshToken}`)
            .expect(401)
    })

    it('logout', async () => {
        await request(app)
            .post(`${PATHS.auth}/logout`)
            .set('Cookie', `refreshToken=${validRefreshToken}`)
            .expect(204)
    })

    it('try to refresh tokens after logout', async () => {
        await request(app)
            .post(`${PATHS.auth}/refresh-token`)
            .set('Cookie', `refreshToken=${validRefreshToken}`)
            .expect(401)
    })
})