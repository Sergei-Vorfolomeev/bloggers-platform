import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {BlogInputModel, BlogViewModel} from "../db/db.types";
import {authMiddleware} from "../middlewares/auth-middleware";
import {HTTP_STATUS} from "../setting";
import {blogValidators} from "../validators/blog-validators";

export const blogsRouter = Router()

blogsRouter.get('/', (req: Request, res: Response<BlogViewModel[]>) => {
    const blogs = blogsRepository.getBlogs()
    res.status(HTTP_STATUS.OK_200).send(blogs)
})

blogsRouter.get('/:id', (req: Request, res: Response<BlogViewModel>) => {
    const postId = req.params.id
    const blog = blogsRepository.getBlogById(postId)
    if (blog) {
        res.status(HTTP_STATUS.OK_200).send(blog)
    } else {
        res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    }
})

blogsRouter.post('/', authMiddleware, blogValidators(),
    (req: Request<any, BlogViewModel, BlogInputModel>, res: Response) => {
        const newBlog = blogsRepository.createBlog(req.body)
        res.status(HTTP_STATUS.CREATED_201).send(newBlog)
    })

blogsRouter.delete('/:id', authMiddleware, (req: Request, res: Response) => {
    const isDeleted = blogsRepository.deleteBlog(req.params.id)
    if (isDeleted) {
        res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
    } else {
        res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    }
})

blogsRouter.put('/:id', authMiddleware, blogValidators(),
    (req: Request<any, any, BlogInputModel>, res: Response) => {
        const isUpdated = blogsRepository.updateBlog(req.params.id, req.body)
        if (isUpdated) {
            res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
        } else {
            res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
        }
    })