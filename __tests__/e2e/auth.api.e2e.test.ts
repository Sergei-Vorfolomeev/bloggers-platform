import {app, PATHS} from "../../src/app";
import {nodemailerService} from "../../src/services/nodemailer-service";

const request = require('supertest')

describe('AUTH-e2e', () => {

    beforeAll(async () => {
        nodemailerService.sendEmail = jest.fn().mockImplementation(() => true)

        await request(app)
            .delete(PATHS.__test__)
            .expect(204)
    })

    let user: any = null
    it('register user', async () => {
        request(app)
            .post(`${PATHS.auth}/registration`)
            .send({
                login: 'test-login',
                email: 'email@gmail.com',
                password: 'test-pass'
            })
            .expect(204)
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
        request(app)
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
    })
})