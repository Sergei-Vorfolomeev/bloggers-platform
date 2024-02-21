import express from "express";
import {blogsRouter} from "./routers/blogs-router";
import {postsRouter} from "./routers/posts-router";
import {testRouter} from "./routers/test-router";
import {authRouter} from "./routers/auth-router";
import {usersRouter} from "./routers/users-router";
import {commentsRouter} from "./routers/comments-router";
import cookieParser from "cookie-parser";

export const PATHS = {
    __test__: '/testing/all-data',
    auth: '/auth',
    blogs: '/blogs',
    posts: '/posts',
    users: '/users',
    comments: '/comments'
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
app.use(cookieParser())
app.use(PATHS.auth, authRouter)
app.use(PATHS.blogs, blogsRouter)
app.use(PATHS.posts, postsRouter)
app.use(PATHS.users, usersRouter)
app.use(PATHS.comments, commentsRouter)
app.use(PATHS.__test__, testRouter)