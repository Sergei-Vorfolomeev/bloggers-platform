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
})