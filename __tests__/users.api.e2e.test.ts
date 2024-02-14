import {app, PATHS} from "../src/app";
import {ADMIN_LOGIN, ADMIN_PASSWORD} from "../src/middlewares/basic-auth-guard";
import {createUsers} from "./utils/create-users";

const request = require('supertest')

describe(PATHS.users, () => {
    const credentials = Buffer.from(`${ADMIN_LOGIN}:${ADMIN_PASSWORD}`).toString('base64')

    beforeAll(async () => {
        await request(app)
            .delete(PATHS.__test__)
            .expect(204)
    })

    it('get empty users', async () => {
        await request(app)
            .get(PATHS.users)
            .expect(200, {items: [], page: 1, pageSize: 10, pagesCount: 1, totalCount: 0})
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
            .expect(400, {
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
            .expect(201)
        createdUser = res.body
        expect(createdUser).toEqual({
            id: expect.any(String),
            ...createdUser
        })
    })

    it('get created user by id', async () => {
        await request(app)
            .get(`${PATHS.users}/${createdUser.id}`)
            .expect(200, createdUser)
    })

    it('delete created user', async () => {
        await request(app)
            .delete(`${PATHS.users}/${createdUser.id}`)
            .set('Authorization', `Basic ${credentials}`)
            .expect(204)
    })
    let users: any[] = []
    it('create many users', async () => {
        users = await createUsers(app, 15)
    })

    it('get all users', async () => {
        const expectedResponse = users.slice(0, 10)
        await request(app)
            .get(PATHS.users)
            .expect(200, {
                items: expectedResponse, page: 1, pageSize: 10, pagesCount: 2, totalCount: 15
            })
    })

    it('get users with query params', async () => {
        const expectedResponse = users.slice().reverse().slice(5, 10).sort((a, b) => a.createdAt - b.createdAt)
        await request(app)
            .get(PATHS.users)
            .query({
                sortBy: 'createdAt',
                sortDirection: 'asc',
                pageNumber: 2,
                pageSize: 5
            })
            .expect(200, {
                items: expectedResponse,
                page: 2,
                pageSize: 5,
                pagesCount: 3,
                totalCount: 15
            })
    })

    it('get users with search param', async () => {
        const expectedResponse = users
            .filter(u => u.login.match('1'))
            .slice(0, 5)
        await request(app)
            .get(PATHS.users)
            .query({
                searchLoginTerm: '1',
                pageNumber: 1,
                pageSize: 5
            })
            .expect(200, {
                items: expectedResponse,
                page: 1,
                pageSize: 5,
                pagesCount: 2,
                totalCount: 6
            })
    })
})