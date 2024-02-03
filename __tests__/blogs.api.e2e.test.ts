import {app, HTTP_STATUS, PATHS} from "../src";
const request = require('supertest')

describe(PATHS.blogs, () => {
    beforeAll(async () => {
        await request(app)
            .delete(PATHS.__test__)
            .expect(204)
    })

    it('get empty blogs', async () => {
        await request(app)
            .get(PATHS.blogs)
            .expect(200, [])
    })

    it('create invalid blog', async () => {
        await request(app)
            .post(PATHS.blogs)
            .send({
                name: 'abcdefgklmn1234567890',
                description: '',
                websiteUrl: '12345'
            })
            .expect(HTTP_STATUS.BAD_REQUEST_400, [
                {
                    type: 'field',
                    value: 'abcdefgklmn1234567890',
                    msg: 'Length should be max 15 symbols',
                    path: 'name',
                    location: 'body'
                },
                {
                    type: 'field',
                    value: '',
                    msg: 'Description is required',
                    path: 'description',
                    location: 'body'
                },
                {
                    type: 'field',
                    value: '12345',
                    msg: 'Incorrect URL',
                    path: 'websiteUrl',
                    location: 'body'
                },
            ])
    })

    it('get blogs without invalid blog', async () => {
        await request(app)
            .get(PATHS.blogs)
            .expect(200, [])
    })
})