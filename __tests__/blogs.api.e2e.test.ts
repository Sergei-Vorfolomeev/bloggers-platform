import {app, HTTP_STATUS, PATHS} from "../src";

const request = require('supertest')

describe(PATHS.blogs, () => {
    const credentials = Buffer.from('admin:qwerty').toString('base64')

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

    it('create blog without auth', async () => {
        const res = await request(app)
            .post(PATHS.blogs)
            .send({
                name: 'Valid name',
                description: 'Valid description',
                websiteUrl: 'https://valid-site.com',
            })
            .expect(HTTP_STATUS.UNAUTHORIZED_401)
    })

    it('create invalid blog', async () => {
        await request(app)
            .post(PATHS.blogs)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                name: 'suchALongerName1234567890',
                description: '',
                websiteUrl: '12345'
            })
            .expect(HTTP_STATUS.BAD_REQUEST_400, [
                {
                    type: 'field',
                    value: 'suchALongerName1234567890',
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
            .set('Authorization', `Basic ${credentials}`)
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

    it('get created blog by id', async () => {
        await request(app)
            .get(`${PATHS.blogs}/${createdBlog.id}`)
            .expect(HTTP_STATUS.OK_200, createdBlog)
    })

    it('get blogs with created blog', async () => {
        await request(app)
            .get(PATHS.blogs)
            .expect(200, [createdBlog])
    })


    it('update blog with invalid data', async () => {
        await request(app)
            .put(`${PATHS.blogs}/${createdBlog.id}`)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                name: 'suchALongerName1234567890',
                description: '',
                websiteUrl: '12345'
            })
            .expect(HTTP_STATUS.BAD_REQUEST_400, [
                {
                    type: 'field',
                    value: 'suchALongerName1234567890',
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

    it('update blog with invalid id', async () => {
        await request(app)
            .put(`${PATHS.blogs}/8437535`)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                name: 'valid',
                description: 'valid',
                websiteUrl: 'https://valid.com'
            })
            .expect(HTTP_STATUS.NOT_FOUND_404)
    })

    it('delete created blog with wrong id', async () => {
        await request(app)
            .delete(`${PATHS.blogs}/43785643`)
            .set('Authorization', `Basic ${credentials}`)
            .expect(HTTP_STATUS.NOT_FOUND_404)
    })

    it('delete blog without auth', async () => {
        await request(app)
            .delete(`${PATHS.blogs}/${createdBlog.id}`)
            .expect(HTTP_STATUS.UNAUTHORIZED_401)
    })

    it('delete created blog', async () => {
        await request(app)
            .delete(`${PATHS.blogs}/${createdBlog.id}`)
            .set('Authorization', `Basic ${credentials}`)
            .expect(HTTP_STATUS.NO_CONTENT_204)
    })
})