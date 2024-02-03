import {app, HTTP_STATUS, PATHS} from "../src/setting";

const request = require('supertest')

describe(PATHS.posts, () => {
    const credentials = Buffer.from('admin:qwerty').toString('base64')

    beforeAll(async () => {
        await request(app)
            .delete(PATHS.__test__)
            .expect(HTTP_STATUS.NO_CONTENT_204)
    })

    it('get empty posts', async () => {
        await request(app)
            .get(PATHS.posts)
            .expect(HTTP_STATUS.OK_200, [])
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
        const res = await request(app)
            .get(`${PATHS.blogs}/${createdBlog.id}`)
            .expect(HTTP_STATUS.OK_200, createdBlog)
        createdBlog = res.body
    })

    it('create post without auth', async () => {
        await request(app)
            .post(PATHS.posts)
            .send({
                blogId: createdBlog.id,
                title: 'Valid title',
                shortDescription: 'Valid description',
                content: 'https://valid-site.com',
            })
            .expect(HTTP_STATUS.UNAUTHORIZED_401)
    })

    it('create invalid post', async () => {
        await request(app)
            .post(PATHS.posts)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                blogId: '843753',
                title: 'suchALongerName1234567890   suchALongerName1234567890',
                shortDescription: '',
            })
            .expect(HTTP_STATUS.BAD_REQUEST_400,[
                {
                    type: 'field',
                    value: 'suchALongerName1234567890   suchALongerName1234567890',
                    msg: 'Max length is 30 symbols',
                    path: 'title',
                    location: 'body'
                },
                {
                    type: 'field',
                    value: '',
                    msg: 'Short description is required',
                    path: 'shortDescription',
                    location: 'body'
                },
                {
                    type: 'field',
                    value: '',
                    msg: 'Content is required',
                    path: 'content',
                    location: 'body'
                },
                {
                    type: 'field',
                    value: '843753',
                    msg: 'Blog with this id does not exist',
                    path: 'blogId',
                    location: 'body'
                }
            ])
    })

    it('get posts without invalid post', async () => {
        await request(app)
            .get(PATHS.posts)
            .expect(HTTP_STATUS.OK_200, [])
    })

    let createdPost: any = null
    it('create valid post', async () => {
        const res = await request(app)
            .post(PATHS.posts)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                blogId: createdBlog.id,
                title: 'Valid title',
                shortDescription: 'Valid description',
                content: 'Valid content',
            })
            .expect(HTTP_STATUS.CREATED_201)
        createdPost = res.body
        expect(createdPost).toEqual({
            id: expect.any(String),
            blogName: createdBlog.name,
            ...createdPost
        })
    })

    it('get created post by id', async () => {
        await request(app)
            .get(`${PATHS.posts}/${createdPost.id}`)
            .expect(HTTP_STATUS.OK_200, createdPost)
    })

    it('get posts with created post', async () => {
        await request(app)
            .get(PATHS.posts)
            .expect(HTTP_STATUS.OK_200, [createdPost])
    })

    it('update post with invalid data', async () => {
        await request(app)
            .put(`${PATHS.posts}/1`)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                blogId: '1',
                title: 'suchALongerName1234567890 suchALongerName1234567890',
                shortDescription: '',
            })
            .expect(HTTP_STATUS.BAD_REQUEST_400, [
                    {
                        type: 'field',
                        value: 'suchALongerName1234567890 suchALongerName1234567890',
                        msg: 'Max length is 30 symbols',
                        path: 'title',
                        location: 'body'
                    },
                    {
                        type: 'field',
                        value: '',
                        msg: 'Short description is required',
                        path: 'shortDescription',
                        location: 'body'
                    },
                    {
                        type: 'field',
                        value: '',
                        msg: 'Content is required',
                        path: 'content',
                        location: 'body'
                    },
                    {
                        type: 'field',
                        value: '1',
                        msg: 'Blog with this id does not exist',
                        path: 'blogId',
                        location: 'body'
                    }
                ]
            )
    })

    it('update post with invalid id', async () => {
        await request(app)
            .put(`${PATHS.posts}/8437535`)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                blogId: '1',
                title: 'Valid title',
                shortDescription: 'Valid description',
                content: 'Valid content',
            })
            .expect(HTTP_STATUS.BAD_REQUEST_400)
    })

    it('update post with valid data', async () => {
       await request(app)
            .put(`${PATHS.posts}/${createdPost.id}`)
            .set('Authorization', `Basic ${credentials}`)
            .send({
                blogId: createdBlog.id,
                title: 'Changed title',
                shortDescription: 'Changed description',
                content: 'Post Content',
            })
            .expect(HTTP_STATUS.NO_CONTENT_204)
    })

    it('get updated post by id', async () => {
        await request(app)
            .get(`${PATHS.posts}/${createdPost.id}`)
            .expect(HTTP_STATUS.OK_200)
            .expect({
                id: createdPost.id,
                blogId:  createdBlog.id,
                blogName: createdBlog.name,
                title: 'Changed title',
                shortDescription: 'Changed description',
                content: 'Post Content',
            })
    })

    it('delete created post with wrong id', async () => {
        await request(app)
            .delete(`${PATHS.posts}/43785643`)
            .set('Authorization', `Basic ${credentials}`)
            .expect(HTTP_STATUS.NOT_FOUND_404)
    })

    it('delete post without auth', async () => {
        await request(app)
            .delete(`${PATHS.posts}/${createdPost.id}`)
            .expect(HTTP_STATUS.UNAUTHORIZED_401)
    })

    it('delete created post', async () => {
        await request(app)
            .delete(`${PATHS.posts}/${createdPost.id}`)
            .set('Authorization', `Basic ${credentials}`)
            .expect(HTTP_STATUS.NO_CONTENT_204)
    })
})