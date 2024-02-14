import {app, PATHS} from "../src/app";

const request = require('supertest')

describe(PATHS.comments, () => {
    beforeAll(async () => {
        await request(app)
            .delete(PATHS.__test__)
            .expect(204)
    })

    it('get empty comments', async () => {
        await request(app)
            .get(PATHS.comments)
            .expect(200, [])
    })
})