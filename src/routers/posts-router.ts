import {Request, Response, Router} from "express";
import {PostsRepository} from "../repositories/posts-repository";
import {PostInputModel, PostViewModel} from "../db/db.types";
import {authMiddleware} from "../middlewares/auth-middleware";
import {postValidators} from "../validators/post-validators";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, ResponseWithBody} from "./types";
import {ObjectId} from "mongodb";

export const postsRouter = Router()

postsRouter.get('/', async (req: Request, res: Response) => {
    const posts = await PostsRepository.getPosts()
    posts
        ? res.status(200).send(posts)
        : res.sendStatus(500)
})

postsRouter.get('/:id',
    async (req: RequestWithParams, res: ResponseWithBody<PostViewModel>) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const post = await PostsRepository.getPostById(id)
        post
            ? res.status(200).send(post)
            : res.sendStatus(404)
    })

postsRouter.post('/', authMiddleware, postValidators(),
    async (req: RequestWithBody<PostInputModel>, res: ResponseWithBody<PostViewModel>) => {
        const newPost = await PostsRepository.createPost(req.body)
        newPost
            ? res.status(201).send(newPost)
            : res.sendStatus(400)
    })

postsRouter.put('/:id', authMiddleware, postValidators(),
    async (req: RequestWithParamsAndBody<PostInputModel>, res: Response) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const isUpdated = await PostsRepository.updatePost(id, req.body)
        isUpdated
            ? res.sendStatus(204)
            : res.sendStatus(404)
    })

postsRouter.delete('/:id', authMiddleware,
    async (req: RequestWithParams, res: Response) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const isDeleted = await PostsRepository.deletePost(id)
        isDeleted
            ? res.sendStatus(204)
            : res.sendStatus(404)
    })
