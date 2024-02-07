import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {BlogInputModel, BlogViewModel} from "../db/db.types";
import {authMiddleware} from "../middlewares/auth-middleware";
import {blogValidators} from "../validators/blog-validators";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, ResponseWithBody} from "./types";
import {ObjectId} from "mongodb";

export const blogsRouter = Router()

blogsRouter.get('/', async (req: Request, res: ResponseWithBody<BlogViewModel[]>) => {
    const blogs = await blogsRepository.getBlogs()
    res.status(200).send(blogs)
})

blogsRouter.get('/:id', async (req: RequestWithParams, res: ResponseWithBody<BlogViewModel>) => {
    const postId = req.params.id
    if (!ObjectId.isValid(postId)) {
        res.sendStatus(404)
        return
    }
    const blog = await blogsRepository.getBlogById(postId)
    if (!blog) {
        res.sendStatus(400)
        return
    }
    res.status(200).send(blog)
})

blogsRouter.post('/', authMiddleware, blogValidators(), async (req: RequestWithBody<BlogInputModel>, res: Response) => {
    const newBlog = await blogsRepository.createBlog(req.body)
    if (!newBlog) res.sendStatus(400)
    res.status(201).send(newBlog)
})

blogsRouter.delete('/:id', authMiddleware, async (req: RequestWithParams, res: Response) => {
    const postId = req.params.id
    if (!ObjectId.isValid(postId)) {
        res.sendStatus(404)
        return
    }
    const isDeleted = await blogsRepository.deleteBlog(postId)
    if (!isDeleted) {
        res.sendStatus(404)
        return
    }
    res.sendStatus(204)
})

blogsRouter.put('/:id', authMiddleware, blogValidators(), async (req: RequestWithParamsAndBody<BlogInputModel>, res: Response) => {
    const postId = req.params.id
    if (!ObjectId.isValid(postId)) {
        res.sendStatus(404)
        return
    }
    const isUpdated = await blogsRepository.updateBlog(postId, req.body)
    if (!isUpdated) {
        res.sendStatus(404)
        return
    }
    res.sendStatus(204)
})