import {app, HTTP_STATUS, PATHS} from "../src/setting";
import {ObjectId} from "mongodb";

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
            .expect(200, { items: [], page: 1, pageSize: 10, pagesCount: 1, totalCount: 0 })
    })

    it('create blog without auth', async () => {
        await request(app)
            .post(PATHS.blogs)
            .send({
                name: 'Valid name',
                description: 'Valid description',
                websiteUrl: 'https://valid-site.com',
            })
            .expect(401)
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
            .expect(HTTP_STATUS.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'Length should be max 15 symbols',
                        field: 'name',
                    },
                    {
                        message: 'Description is required',
                        field: 'description',
                    },
                    {
                        message: 'Incorrect URL',
                        field: 'websiteUrl',
                    },
                ]
            })
    })

    it('get blogs without invalid blog', async () => {
        await request(app)
            .get(PATHS.blogs)
            .expect(200, { items: [], page: 1, pageSize: 10, pagesCount: 1, totalCount: 0 })
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
            .expect(200, {
                items: [createdBlog],
                page: 1,
                pageSize: 10,
                pagesCount: 1,
                totalCount: 1
            })
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
            .expect(HTTP_STATUS.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'Length should be max 15 symbols',
                        field: 'name',
                    },
                    {
                        message: 'Description is required',
                        field: 'description',
                    },
                    {
                        message: 'Incorrect URL',
                        field: 'websiteUrl',
                    },
                ]
            })
    })

    it('update blog with non-existing id', async () => {
        const validMongoID = new ObjectId().toHexString();
        await request(app)
            .put(`${PATHS.blogs}/${validMongoID}`)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                name: 'valid',
                description: 'valid',
                websiteUrl: 'https://valid.com'
            })
            .expect(HTTP_STATUS.NOT_FOUND_404)
    })

    it('delete created blog with non-existing id', async () => {
        const validMongoID = new ObjectId().toHexString();
        await request(app)
            .delete(`${PATHS.blogs}/${validMongoID}`)
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