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

    let createdBlog: any = null
    it('create valid blog', async () => {
        const res = await request(app)
            .post(PATHS.blogs)
            .send({
                name: 'Valid name',
                description: 'Valid description',
                websiteUrl: 'https://valid-site.com',
            })
            .expect(HTTP_STATUS.CREATED_201)
        createdBlog = res.body
        expect(createdBlog).toEqual({
            id: expect.any(String),
            ...createdBlog
        })
    })

    it('get blogs with created blog', async () => {
        await request(app)
            .get(PATHS.blogs)
            .expect(200, [createdBlog])
    })
})