import {app, PATHS} from "../../src/app";
import {nodemailerService} from "../../src/services/nodemailer-service";

const request = require('supertest')

describe(PATHS.auth, () => {
    nodemailerService.sendEmail = jest.fn().mockImplementation(() => true)

    beforeAll(async () => {
        await request(app)
            .delete(PATHS.__test__)
            .expect(204)
    })

    let user: any = null
    it('register user', async () => {
        const res = request(app)
            .post(`${PATHS.auth}/registration`)
            .send({
                login: 'test-login',
                email: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(204)
        user = res.body
    })

    it('get registered user', async () => {
        request(app)
            .get(PATHS.users)
            .expect(200, [{
                login: 'test-login',
                email: 'email@gmail.com',
                password: 'test-pass',
                createdAt: expect.any(Date),
                emailConfirmation: {
                    confirmationCode: expect.any(String),
                    expirationDate: expect.any(Date),
                    isConfirmed: false
                }
            }])
    })

    it('shouldn\'t create user twice', async () => {
        const res = request(app)
            .post(`${PATHS.auth}/registration`)
            .send({
                login: 'test-login',
                email: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(400, {
                errorsMessages: [
                    {
                        message: 'User with such email already exists',
                        field: 'email'
                    },
                    {
                        message: 'User with such login already exists',
                        field: 'login'
                    }
                ]
            })
        user = res.body
    })
})