import {app, HTTP_STATUS, PATHS} from "../src/setting";

const request = require('supertest')

describe(PATHS.users, () => {
    const credentials = Buffer.from('admin:qwerty').toString('base64')

    beforeAll(async () => {
        await request(app)
            .delete(PATHS.__test__)
            .expect(204)
    })

    it('get empty users', async () => {
        await request(app)
            .get(PATHS.users)
            .expect(200, { items: [], page: 1, pageSize: 10, pagesCount: 1, totalCount: 0 })
    })

    it('create user without auth', async () => {
        await request(app)
            .post(PATHS.users)
            .send({
                login: 'validLogin',
                email: 'validEmail@gmail.com',
                password: 'validPassword',
            })
            .expect(401)
    })

    it('create invalid user', async () => {
        await request(app)
            .post(PATHS.users)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                login: 'INVALID INVALID INVALID INVALID INVALID INVALID ',
                email: '123',
            })
            .expect(HTTP_STATUS.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'Length must be from 3 to 10 symbols',
                        field: 'login',
                    },
                    {
                        message: 'Field is incorrect',
                        field: 'email',
                    },
                    {
                        message: 'Field is required',
                        field: 'password',
                    },
                ]
            })
    })

    let createdUser: any = null
    it('create valid user', async () => {
        const res = await request(app)
            .post(PATHS.users)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                login: 'VALID',
                email: 'valid@gmail.com',
                password: 'validPassword',
            })
            .expect(HTTP_STATUS.CREATED_201)
        createdUser = res.body
        expect(createdUser).toEqual({
            id: expect.any(String),
            ...createdUser
        })
    })

    it('get created user by id', async () => {
        await request(app)
            .get(`${PATHS.users}/${createdUser.id}`)
            .expect(HTTP_STATUS.OK_200, createdUser)
    })

    it('delete created user', async () => {
        await request(app)
            .delete(`${PATHS.users}/${createdUser.id}`)
            .set('Authorization', `Basic ${credentials}`)
            .expect(HTTP_STATUS.NO_CONTENT_204)
    })

})