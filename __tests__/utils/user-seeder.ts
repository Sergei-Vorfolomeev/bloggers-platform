import {PATHS} from "../../src/app";
import {ADMIN_LOGIN, ADMIN_PASSWORD} from "../../src/middlewares/basic-auth-guard";

const request = require('supertest')

export const userSeeder = {
    async createUser(app: any) {
        const response = await request(app)
            .post(PATHS.users)
            .auth(ADMIN_LOGIN, ADMIN_PASSWORD)
            .send({
                login: 'test-login',
                email: 'test@gmail.com',
                password: 'test-pass',
            })
            .expect(201)
        return response.body
    },

    async createUsers(app: any, count: number) {
        const users = []
        for (let i = 0; i < count; i++) {
            try {
                const response = await request(app)
                    .post(PATHS.users)
                    .auth(ADMIN_LOGIN, ADMIN_PASSWORD)
                    .send({
                        login: `test-${i}`,
                        email: `test-${i}-@gmail.com`,
                        password: `test-pass`,
                    })
                    .expect(201)
                users.push(response.body)
            } catch (e) {
                console.error(e)
            }
        }
        return users.reverse()
    },

    async meRequest(app: any, token: string) {
        const res = await request(app)
            .get(`${PATHS.auth}/me`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        return res.body
    },

    async registerUser(app: any) {
        const i = Math.ceil(Math.random()*1000)
        await request(app)
            .post(`${PATHS.auth}/registration`)
            .send({
                login: `login-${i}`,
                email: `email${i}@gmail.com`,
                password: 'test-pass'
            })
            .expect(204)
        return {
            login: `login-${i}`,
            email: `email${i}@gmail.com`,
            password: 'test-pass'
        }
    },

    async loginUser(app: any, loginOrEmail: string, password: string) {
        const res = await request(app)
            .post(`${PATHS.auth}/login`)
            .send({
                loginOrEmail,
                password
            })
            .expect(200)

        const cookieHeader = res.headers['set-cookie']
        const refreshToken = cookieHeader[0].split(';')[0].split('=')[1]
        expect(refreshToken).toEqual(expect.any(String))
        expect(refreshToken).toContain('.')
        expect(res.body.accessToken).toEqual(expect.any(String))
        expect(res.body.accessToken).toContain('.')

        return {accessToken: res.body.accessToken, refreshToken}
    },

    async loginUserWithUserAgent(app: any, loginOrEmail: string, password: string, userAgent: string) {
        const res = await request(app)
            .post(`${PATHS.auth}/login`)
            .set('User-Agent', userAgent)
            .send({
                loginOrEmail,
                password
            })
            .expect(200)

        const cookieHeader = res.headers['set-cookie']
        const refreshToken = cookieHeader[0].split(';')[0].split('=')[1]
        expect(refreshToken).toEqual(expect.any(String))
        expect(refreshToken).toContain('.')
        expect(res.body.accessToken).toEqual(expect.any(String))
        expect(res.body.accessToken).toContain('.')

        return {accessToken: res.body.accessToken, refreshToken}
    }
}





