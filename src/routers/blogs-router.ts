import {Router} from "express";
import {BlogsRepository} from "../repositories/blogs-repository";
import {authMiddleware} from "../middlewares/auth-middleware";
import {blogValidators} from "../validators/blog-validators";
import {
    BlogInputModel,
    BlogsQueryParams, Paginator,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery,
    ResponseType,
    ResponseWithBody
} from "./types";
import {ObjectId} from "mongodb";
import {BlogsQueryRepository} from "../repositories/blogs-query-repository";
import {BlogsService} from "../services/blogs-service";
import {BlogViewModel} from "../services/types";

export const blogsRouter = Router()

blogsRouter.get('/', async (req: RequestWithQuery<BlogsQueryParams>, res: ResponseWithBody<Paginator<BlogViewModel[]> | null>) => {
    const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = req.query
    const sortParams = {
        searchNameTerm: searchNameTerm ?? null,
        sortBy: sortBy ?? 'createdAt',
        sortDirection: sortDirection ?? 'desc',
        pageNumber: pageNumber ? +pageNumber : 1,
        pageSize: pageSize ? +pageSize : 10,
    }
    const blogs = await BlogsQueryRepository.getBlogs(sortParams)
    blogs
        ? res.status(200).send(blogs)
        : res.sendStatus(500)
})

blogsRouter.get('/:id', async (req: RequestWithParams, res: ResponseWithBody<BlogViewModel>) => {
    const {id} = req.params
    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const blog = await BlogsQueryRepository.getBlogById(id)
    blog
        ? res.status(200).send(blog)
        : res.sendStatus(404)
})

blogsRouter.post('/', authMiddleware, blogValidators(),
    async (req: RequestWithBody<BlogInputModel>, res: ResponseType) => {
    const newBlog = await BlogsService.createBlog(req.body)
    if (!newBlog) res.sendStatus(400)
    res.status(201).send(newBlog)
})

blogsRouter.put('/:id', authMiddleware, blogValidators(), async (req: RequestWithParamsAndBody<BlogInputModel>, res: ResponseType) => {
    const {id} = req.params
    const {name, description, websiteUrl} = req.body
    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const dataForUpdate = {name, description, websiteUrl}
    const isUpdated = await BlogsRepository.updateBlog(id, dataForUpdate)
    isUpdated
        ? res.sendStatus(204)
        : res.sendStatus(404)
})

blogsRouter.delete('/:id', authMiddleware, async (req: RequestWithParams, res: ResponseType) => {
    const {id} = req.params
    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const isDeleted = await BlogsService.deleteBlog(id)
    isDeleted
        ? res.sendStatus(204)
        : res.sendStatus(404)
})