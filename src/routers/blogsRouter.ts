import { Request, Response, Router} from "express";
import expressBasicAuth from "express-basic-auth";
import {blogsRepository} from "../repositories/blogs-repository";
import {BlogInputModel, BlogViewModel} from "../db/db.types";
import {HTTP_STATUS} from "../index";
import {body, ValidationError, validationResult} from "express-validator";

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

const authMiddleware = expressBasicAuth({
    users: {
        admin: 'qwerty'
    },
    challenge: true, // Для отправки запроса аутентификации, если данные не предоставлены
    unauthorizedResponse: 'Unauthorized'
})

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
    (req: Request<any, BlogViewModel, BlogInputModel>, res: Response<BlogViewModel | ValidationError[]>) => {
    const errors = validationResult(req).array()
    if (!errors.length) {
        const newBlog = blogsRepository.createBlog(req.body)
        res.status(HTTP_STATUS.CREATED_201).send(newBlog)
    } else {
        res.status(HTTP_STATUS.BAD_REQUEST_400).send(errors)
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

