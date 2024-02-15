import {ADMIN_LOGIN, ADMIN_PASSWORD} from "../../src/middlewares/basic-auth-guard";
import {createBlog} from "./create-blogs";
import {PATHS} from "../../src/app";

const request = require('supertest')

export const createPost = async (app: any) => {
    const blog = await createBlog(app)
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
}

export const createPosts = async (app: any, count: number) => {
    const blog = await createBlog(app)
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
}