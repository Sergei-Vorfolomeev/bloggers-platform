import express from 'express'
import {blogsRouter} from "./routers/blogsRouter";
import {testRouter} from "./routers/testRouter";

const PORT = process.env.PORT || 4200

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
    NOT_FOUND_404: 404,
}

export const app = express()

app.use(express.json())
app.use(PATHS.blogs, blogsRouter)
app.use(PATHS.__test__, testRouter)

app.listen(PORT, () => {
    console.log(`App is starting on ${PORT} port`)
})
