import {app, PATHS} from "../../src/app";
import {createPost} from "../utils/create-posts";
import {userSeeder} from "../utils/user-seeder";

const request = require('supertest')

describe(PATHS.comments, () => {
    beforeAll(async () => {
        await request(app)
            .delete(PATHS.__test__)
            .expect(204)
    })

    let users: any = null
    let token: any = null
    it('try to login user 1', async () => {
        users = await userSeeder.createUsers(app, 2)
        const res = await request(app)
            .post(`${PATHS.auth}/login`)
            .send({
                loginOrEmail: users[0].login,
                password: "test-pass"
            })
            .expect(200)
        token = res.body.accessToken
        expect(token).toBeDefined()
    })

    it('create comment without token', async () => {
        const post = await createPost(app)
        await request(app)
            .post(`${PATHS.posts}/${post.id}/comments`)
            .send({
                content: 'comment content min 20 symbols'
            })
            .expect(401)
    })

    it('create invalid comment', async () => {
        const post = await createPost(app)
        await request(app)
            .post(`${PATHS.posts}/${post.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'comment content'
            })
            .expect(400, {
                errorsMessages: [
                    {message: 'Length must be from 20 to 300 symbols', field: 'content'},
                ]
            })
    })

    let post: any = null
    let comment: any = null
    it('create valid comment', async () => {
        const userInfo = await userSeeder.meRequest(app, token)
        post = await createPost(app)
        const res = await request(app)
            .post(`${PATHS.posts}/${post.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'comment content min 20 symbols'
            })
            .expect(201)
        comment = res.body
        expect(comment).toEqual({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: userInfo.userId,
                userLogin: userInfo.login
            },
            createdAt: expect.any(String)
        })
    })

    it('get comment by id', async () => {
        await request(app)
            .get(`${PATHS.comments}/${comment.id}`)
            .expect(200, comment)
    })

    it('get comments by post id', async () => {
        await request(app)
            .get(`${PATHS.posts}/${post.id}/comments`)
            .expect(200, {
                items: [comment],
                page: 1,
                pageSize: 10,
                pagesCount: 1,
                totalCount: 1
            })
    })

    it('update created comment', async () => {
        await request(app)
            .put(`${PATHS.comments}/${comment.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'updated comment lalalalalalal'
            })
            .expect(204)
    })

    let token2: any = null
    it('try to login user 2', async () => {
        users[1] = await userSeeder.createUser(app)
        const res = await request(app)
            .post(`${PATHS.auth}/login`)
            .send({
                loginOrEmail: users[1].login,
                password: "test-pass"
            })
            .expect(200)
        token2 = res.body.accessToken
        expect(token).toBeDefined()
    })

    it('delete created comment with no credentials', async () => {
        await request(app)
            .delete(`${PATHS.comments}/${comment.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(403)
    })

    it('delete created comment', async () => {
        await request(app)
            .delete(`${PATHS.comments}/${comment.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
    })
})