import {app, PATHS} from "../../src/app";
import {MongoMemoryServer} from "mongodb-memory-server";
import {SentMessageInfo} from "nodemailer";
import {userSeeder} from "../utils/user-seeder";
import mongoose from "mongoose";
import {UserModel} from "../../src/db/mongoose/models/user.model";
import {nodemailerService} from "../../src/composition-root";

const request = require('supertest')

describe('AUTH-e2e', () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        jest.restoreAllMocks()
        await mongoose.disconnect()
    })

    let user: any = null
    it('register user', async () => {
        const spy = jest.spyOn(nodemailerService, 'sendEmail').mockReturnValueOnce(Promise.resolve(true as SentMessageInfo))

        await request(app)
            .post(`${PATHS.auth}/registration`)
            .send({
                login: 'test-login',
                email: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(204)

        expect(spy).toHaveBeenCalled()
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
    })

    it('refresh all tokens', async () => {
        await new Promise(resolve => {
            setTimeout(() => {
                resolve(1)
            }, 1000)
        })

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

    describe('recover password', () => {

        let user: any = null
        let recoveryCode: any = null
        it('successful request to change password', async () => {

            const {email} = await userSeeder.registerUser(app)
            await request(app)
                .post(`${PATHS.auth}/password-recovery`)
                .send({
                    email
                })
                .expect(204)

            user = await UserModel.findOne().where('email').equals(email)
            recoveryCode = user.passwordRecovery.recoveryCode
        })

        it('successful update password', async () => {
            await request(app)
                .post(`${PATHS.auth}/new-password`)
                .send({
                    recoveryCode,
                    newPassword: 'newPassword'
                })
                .expect(204)
        })

        it('login using new password', async () => {
            await request(app)
                .post(`${PATHS.auth}/login`)
                .send({
                    loginOrEmail: user.email,
                    password: 'newPassword'
                })
                .expect(200)
        })

        it('login using old password', async () => {
            await request(app)
                .post(`${PATHS.auth}/login`)
                .send({
                    loginOrEmail: user.email,
                    password: 'test-pass'
                })
                .expect(401)
        })
    })

    describe('test rate limit', () => {

        let user: any = null
        it('try to login many times', async () => {

            await new Promise(resolve => {
                setTimeout(() => {
                    resolve(1)
                }, 10000)
            })

            user = await userSeeder.registerUser(app)
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post(`${PATHS.auth}/login`)
                    .send({
                        loginOrEmail: user.email,
                        password: `pass${i}`
                    })
                    .expect(401)
            }
        })

        it('get 429 status - too many requests', async () => {
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post(`${PATHS.auth}/login`)
                    .send({
                        loginOrEmail: user.email,
                        password: `pass$`
                    })
                    .expect(429)
            }

            await new Promise(resolve => {
                setTimeout(() => {
                    resolve(1)
                }, 10000)
            })
        })

        it('401 after 10 sec', async () => {
            await request(app)
                .post(`${PATHS.auth}/login`)
                .send({
                    loginOrEmail: user.email,
                    password: `pass$`
                })
                .expect(401)
        })
    })
})


