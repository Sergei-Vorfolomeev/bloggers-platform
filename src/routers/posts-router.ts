import {Router, Request, Response} from "express";
import {postsRepository} from "../repositories/posts-repository";
import {HTTP_STATUS} from "../index";
import {PostInputModel, PostViewModel} from "../db/db.types";
import {body, ValidationError, validationResult} from "express-validator";
import {blogsRepository} from "../repositories/blogs-repository";
import {authMiddleware} from "../middlewares/basic-auth";

export const postsRouter = Router()

const validateTitle = () => body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({max: 30}).withMessage('Max length is 30 symbols')

const validateShortDescription = () => body('shortDescription')
    .trim()
    .notEmpty().withMessage('Short description is required')
    .isLength({max: 100}).withMessage('Max length is 100 symbols')

const validateContent = () => body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({max: 1000}).withMessage('Max length is 1000 symbols')

const validateBlogId = () => body('blogId').custom( blogId => {
    const id = blogsRepository.getBlogById(blogId)
    if (!id) {
        throw new Error('Blog with this id does not exist')
    }
})

postsRouter.get('/', (req: Request, res: Response) => {
    const posts = postsRepository.getPosts()
    res.status(HTTP_STATUS.OK_200).send(posts)
})

postsRouter.get('/:id', (req: Request, res: Response) => {
    const post = postsRepository.getPostsById(req.params.id)
    if (post) {
        res.status(HTTP_STATUS.OK_200).send(post)
    } else {
        res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    }
})

postsRouter.delete('/:id', authMiddleware, (req: Request, res: Response) => {
    const isDeleted = postsRepository.deletePost(req.params.id)
    if (isDeleted) {
        res.status(HTTP_STATUS.NO_CONTENT_204)
    } else {
        res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    }
})

postsRouter.post('/',
    authMiddleware,
    validateTitle,
    validateShortDescription,
    validateContent,
    validateBlogId,
    (req: Request<any, PostViewModel, PostInputModel>, res: Response<PostViewModel | ValidationError[]>) => {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            const newPost = postsRepository.createPost(req.body)
            newPost
                ? res.status(HTTP_STATUS.CREATED_201).send(newPost)
                : res.sendStatus(HTTP_STATUS.BAD_REQUEST_400)
        } else {
            res.status(HTTP_STATUS.BAD_REQUEST_400).send(errors.array())
        }
})

postsRouter.put('/:id',
    authMiddleware,
    validateTitle,
    validateShortDescription,
    validateContent,
    validateBlogId,
    (req: Request<any, ValidationError[], PostInputModel>, res: Response<ValidationError[]>) => {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            const isUpdated = postsRepository.updatePost(req.params.id, req.body)
            isUpdated
                ? res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
                : res.sendStatus(HTTP_STATUS.BAD_REQUEST_400)
        } else {
            res.status(HTTP_STATUS.BAD_REQUEST_400).send(errors.array())
        }
    })