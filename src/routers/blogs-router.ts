import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {BlogInputModel, BlogViewModel} from "../db/db.types";
import {body, Result, validationResult} from "express-validator";
import {authMiddleware} from "../middlewares/basic-auth";
import {HTTP_STATUS} from "../setting";
import {formatError} from "../utils/formatError";

export const blogsRouter = Router()

const validateName = () => body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({max: 15}).withMessage('Length should be max 15 symbols')

const validateDescription = () => body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({max: 500}).withMessage('Length should be max 500 symbols')

const validateWebsiteUrl = () => body('websiteUrl')
    .trim()
    .notEmpty().withMessage('WebsiteUrl is required')
    .isLength({max: 100}).withMessage('Length should be max 100 symbols')
    .isURL().withMessage('Incorrect URL')



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

blogsRouter.post('/',
    authMiddleware,
    validateName(),
    validateDescription(),
    validateWebsiteUrl(),
    (req: Request<any, BlogViewModel, BlogInputModel>, res: Response) => {
        const errors: Result = validationResult(req)
        if (errors.isEmpty()) {
            const newBlog = blogsRepository.createBlog(req.body)
            res.status(HTTP_STATUS.CREATED_201).send(newBlog)
        } else {
            const formattedErrors = errors.array({ onlyFirstError: true }).map(el => formatError(el))
            res.status(HTTP_STATUS.BAD_REQUEST_400).send({ errorsMessages: formattedErrors })
        }
    })

blogsRouter.delete('/:id', authMiddleware, (req: Request, res: Response) => {
    const isDeleted = blogsRepository.deleteBlog(req.params.id)
    if (isDeleted) {
        res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
    } else {
        res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    }
})

blogsRouter.put('/:id',
    authMiddleware,
    validateName(),
    validateDescription(),
    validateWebsiteUrl(),
    (req: Request<any, any, BlogInputModel>, res: Response) => {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            const isUpdated = blogsRepository.updateBlog(req.params.id, req.body)
            if (isUpdated) {
                res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
            } else {
                res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
            }
        } else {
            const formattedErrors = errors.array({ onlyFirstError: true }).map(el => formatError(el))
            res.status(HTTP_STATUS.BAD_REQUEST_400).send({ errorsMessages: formattedErrors })
        }
    })