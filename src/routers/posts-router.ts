import {Router} from "express";
import {authMiddleware} from "../middlewares/auth-middleware";
import {postValidators} from "../validators/post-validators";
import {
    PostInputModel,
    QueryParams,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithQuery,
    ResponseType,
    ResponseWithBody
} from "./types";
import {ObjectId} from "mongodb";
import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {PostViewModel} from "../services/types";
import {PostsService} from "../services/posts-service";

export const postsRouter = Router()

postsRouter.get('/', async (req: RequestWithQuery<QueryParams>, res: ResponseType) => {
    const {sortBy, sortDirection, pageNumber, pageSize} = req.query
    const sortParams = {
        sortBy: sortBy ?? 'createdAt',
        sortDirection: sortDirection ?? 'desc',
        pageNumber: pageNumber ? +pageNumber : 1,
        pageSize: pageSize ? +pageSize : 10,
    }
    const posts = await PostsQueryRepository.getPosts(sortParams)
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
        const post = await PostsQueryRepository.getPostById(id)
        post
            ? res.status(200).send(post)
            : res.sendStatus(404)
    })

postsRouter.post('/', authMiddleware, postValidators(),
    async (req: RequestWithBody<PostInputModel>, res: ResponseWithBody<PostViewModel>) => {
        const newPost = await PostsService.createPost(req.body)
        newPost
            ? res.status(201).send(newPost)
            : res.sendStatus(400)
    })

postsRouter.put('/:id', authMiddleware, postValidators(),
    async (req: RequestWithParamsAndBody<PostInputModel>, res: ResponseType) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const isUpdated = await PostsService.updatePost(id, req.body)
        isUpdated
            ? res.sendStatus(204)
            : res.sendStatus(404)
    })

postsRouter.delete('/:id', authMiddleware,
    async (req: RequestWithParams, res: ResponseType) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const isDeleted = await PostsService.deletePost(id)
        isDeleted
            ? res.sendStatus(204)
            : res.sendStatus(404)
    })
