import express from "express";
import {blogsRouter} from "./routers/blogs-router";
import {postsRouter} from "./routers/posts-router";
import {testRouter} from "./routers/test-router";

export const PATHS = {
    __test__: '/testing/all-data',
    blogs: '/blogs',
    posts: '/posts'
}

export const HTTP_STATUS = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    UNAUTHORIZED_401: 401,
    NOT_FOUND_404: 404,
}

export const app = express()

app.use(express.json())
app.use(PATHS.blogs, blogsRouter)
app.use(PATHS.posts, postsRouter)
app.use(PATHS.__test__, testRouter)