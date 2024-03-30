import {ADMIN_LOGIN, ADMIN_PASSWORD} from "../../src/middlewares/basic-auth-guard";
import {PATHS} from "../../src/app";
import {blogTestHelper} from "./blog-test-helper";
import {UserViewModel} from "../../src/services/types";

const request = require('supertest')

export const postTestHelper = {
    async createPost (app: any) {
        const blog = await blogTestHelper.createBlog(app)
        const response = await request(app)
            .post(PATHS.posts)
            .auth(ADMIN_LOGIN, ADMIN_PASSWORD)
            .send({
                blogId: blog.id,
                title: 'Post title',
                shortDescription: 'Post description',
                content: 'Post content',
            })
            .expect(201)
        return response.body
    },

    async createPosts (app: any, count: number) {
        const blog = await blogTestHelper.createBlog(app)
        const posts = []
        for (let i=0; i<count; i++) {
            try {
                const response = await request(app)
                    .post(PATHS.posts)
                    .auth(ADMIN_LOGIN, ADMIN_PASSWORD)
                    .send({
                        blogId: blog.id,
                        title: `Post-${i}-title`,
                        shortDescription: `Post-${i}-description`,
                        content: `Post-${i}-content`,
                    })
                    .expect(201)
                posts.push(response.body)
            } catch (e) {
                console.error(e)
            }
        }
        const reversedPosts = posts.reverse()
        return {reversedPosts, blog}
    },

    async createPostWithComment(app: any, accessToken: string) {
        const post = await this.createPost(app)
        const response = await request(app)
            .post(`${PATHS.posts}/${post.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                content: 'comment content min 20 symbols'
            })
            .expect(201)

        const comment = response.body
        expect(comment).toEqual({
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: expect.any(String),
                userLogin: expect.any(String)
            },
            createdAt: expect.any(String)
        })
        return comment
    }
}