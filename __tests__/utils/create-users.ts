import {PATHS} from "../../src/app";
import {ADMIN_LOGIN, ADMIN_PASSWORD} from "../../src/middlewares/basic-auth-guard";

const request = require('supertest')

export const createUser = async (app: any) => {
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
}

export const createUsers = async (app: any, count: number) => {
    const users = []
    for (let i=0; i<count; i++) {
        try {
            const response = await request(app)
                .post(PATHS.users)
                .auth(ADMIN_LOGIN, ADMIN_PASSWORD)
                .send({
                    login: `test-${i}`,
                    email: `test-${i}-@gmail.com`,
                    password: `test-${i}-pass`,
                })
                .expect(201)
            users.push(response.body)
        } catch (e) {
            console.error(e)
        }
    }
    return users.reverse()
}