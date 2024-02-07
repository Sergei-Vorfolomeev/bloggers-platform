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
    const {id} = req.params
    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const blog = await blogsRepository.getBlogById(id)
    blog
        ? res.status(200).send(blog)
        : res.sendStatus(404)
})

blogsRouter.post('/', authMiddleware, blogValidators(), async (req: RequestWithBody<BlogInputModel>, res: Response) => {
    const newBlog = await blogsRepository.createBlog(req.body)
    if (!newBlog) res.sendStatus(400)
    res.status(201).send(newBlog)
})

blogsRouter.delete('/:id', authMiddleware, async (req: RequestWithParams, res: Response) => {
    const {id} = req.params
    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const isDeleted = await blogsRepository.deleteBlog(id)
    isDeleted
        ? res.sendStatus(204)
        : res.sendStatus(404)
})

blogsRouter.put('/:id', authMiddleware, blogValidators(), async (req: RequestWithParamsAndBody<BlogInputModel>, res: Response) => {
    const {id} = req.params
    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const isUpdated = await blogsRepository.updateBlog(id, req.body)
    isUpdated
        ? res.sendStatus(204)
        : res.sendStatus(404)
})