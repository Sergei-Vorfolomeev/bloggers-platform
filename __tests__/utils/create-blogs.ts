import {ADMIN_LOGIN, ADMIN_PASSWORD} from "../../src/middlewares/basic-auth-guard";
import {PATHS} from "../../src/app";

const request = require('supertest')

export const createBlog = async (app: any) => {
    const response = await request(app)
        .post(PATHS.blogs)
        .auth(ADMIN_LOGIN, ADMIN_PASSWORD)
        .send({
            name: 'test-blog',
            description: 'test',
            websiteUrl: 'https://test-website.com',
        })
        .expect(201)
    return response.body
}

export const createBlogs = async (app: any, count: number) => {
    const blogs = []
    for (let i=0; i<count; i++) {
        try {
            const response = await request(app)
                .post(PATHS.blogs)
                .auth(ADMIN_LOGIN, ADMIN_PASSWORD)
                .send({
                    name: `test-${i}-blog`,
                    description: `test-${i}-description`,
                    websiteUrl: `https://test-${i}.com`,
                })
                .expect(201)
            blogs.push(response.body)
        } catch (e) {
            console.error(e)
        }
    }
    return blogs.reverse()
}