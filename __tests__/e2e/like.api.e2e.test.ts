import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {userSeeder} from "../utils/user-seeder";
import {app, PATHS} from "../../src/app";
import {postTestHelper} from "../utils/post-test-helper";

const request = require('supertest')

describe('LIKE-e2e', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
    })

    let user: any = null
    it('create user', async () => {
        user = await userSeeder.registerUser(app)
    })

    let tokens: any = null
    it('login user', async () => {
        tokens = await userSeeder.loginUser(app, user.email, user.password)
    })

    let comment: any = null
    it('create blog, post, comment', async () => {
        comment = await postTestHelper.createPostWithComment(app, tokens.accessToken)
    })

    it('get comment by unauthorized user', async () => {
        const response = await request(app)
            .get(`${PATHS.comments}/${comment.id}`)
            .expect(200)

        expect(response.body).toEqual({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: expect.any(String),
            likesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: "None",
            },
        })
    })

    it('add like', async () => {
        await request(app)
            .put(`${PATHS.comments}/${comment.id}/like-status`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .send({
                "likeStatus": "Like"
            })
            .expect(204)
    })

    it('get comment by user 1', async () => {
        const response = await request(app)
            .get(`${PATHS.comments}/${comment.id}`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .expect(200)

        expect(response.body).toEqual({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: expect.any(String),
            likesInfo: {
                dislikesCount: 0,
                likesCount: 1,
                myStatus: "Like",
            },
        })
    })

    it('change like to dislike', async () => {
        await request(app)
            .put(`${PATHS.comments}/${comment.id}/like-status`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .send({
                "likeStatus": "Dislike"
            })
            .expect(204)
    })

    it('get changed comment by user 1', async () => {
        const response = await request(app)
            .get(`${PATHS.comments}/${comment.id}`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .expect(200)

        expect(response.body).toEqual({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: expect.any(String),
            likesInfo: {
                dislikesCount: 1,
                likesCount: 0,
                myStatus: "Dislike",
            },
        })
    })

    let user2: any = null
    it('create user 2', async () => {
        user2 = await userSeeder.registerUser(app)
    })

    let tokens2: any = null
    it('login user 2', async () => {
        tokens2 = await userSeeder.loginUser(app, user2.email, user2.password)
    })

    it('get changed comment by user 2', async () => {
        const response = await request(app)
            .get(`${PATHS.comments}/${comment.id}`)
            .set('Authorization', `Bearer ${tokens2.accessToken}`)
            .expect(200)

        expect(response.body).toEqual({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: expect.any(String),
            likesInfo: {
                dislikesCount: 1,
                likesCount: 0,
                myStatus: "None",
            },
        })
    })

    it('set status "like" by user 2', async () => {
        await request(app)
            .put(`${PATHS.comments}/${comment.id}/like-status`)
            .set('Authorization', `Bearer ${tokens2.accessToken}`)
            .send({
                "likeStatus": "Like"
            })
            .expect(204)
    });

    it('set status "none" by user 1', async () => {
        await request(app)
            .put(`${PATHS.comments}/${comment.id}/like-status`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .send({
                "likeStatus": "None"
            })
            .expect(204)
    });

    it('get changed comment by user 1', async () => {
        const response = await request(app)
            .get(`${PATHS.comments}/${comment.id}`)
            .set('Authorization', `Bearer ${tokens.accessToken}`)
            .expect(200)

        expect(response.body).toEqual({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: expect.any(String),
            likesInfo: {
                dislikesCount: 0,
                likesCount: 1,
                myStatus: "None",
            },
        })
    })
})