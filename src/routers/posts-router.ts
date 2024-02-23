import {Router} from "express";
import {basicAuthGuard} from "../middlewares/basic-auth-guard";
import {postValidators} from "../validators/post-validators";
import {
    CommentInputModel,
    Paginator,
    PostInputModel,
    QueryParams,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody, RequestWithParamsAndQuery,
    RequestWithQuery,
    ResponseType,
    ResponseWithBody
} from "./types";
import {ObjectId} from "mongodb";
import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {CommentViewModel, PostViewModel} from "../services/types";
import {PostsService} from "../services/posts-service";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";
import {commentValidator} from "../validators/comment-validator";
import {CommentsService} from "../services/comments-service";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {StatusCode} from "../utils/result";

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

postsRouter.post('/', basicAuthGuard, postValidators(),
    async (req: RequestWithBody<PostInputModel>, res: ResponseWithBody<PostViewModel>) => {
        const {statusCode, data: createdPostId} = await PostsService.createPost(req.body)
        switch (statusCode) {
            case StatusCode.BAD_REQUEST: {
                res.sendStatus(400);
                return
            }
            case StatusCode.SERVER_ERROR: {
                res.sendStatus(555);
                return
            }
            case StatusCode.CREATED: {
                const post = await PostsQueryRepository.getPostById(createdPostId!)
                post
                    ? res.status(201).send(post)
                    : res.sendStatus(400)
            }
        }
    })

postsRouter.put('/:id', basicAuthGuard, postValidators(),
    async (req: RequestWithParamsAndBody<PostInputModel>, res: ResponseType) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await PostsService.updatePost(id, req.body)
        switch (statusCode) {
            case StatusCode.NOT_FOUND: {
                res.sendStatus(404);
                return
            }
            case StatusCode.SERVER_ERROR: {
                res.sendStatus(555);
                return
            }
            case StatusCode.NO_CONTENT: {
                res.sendStatus(204)
                return
            }
        }
    })

postsRouter.delete('/:id', basicAuthGuard,
    async (req: RequestWithParams, res: ResponseType) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await PostsService.deletePost(id)
        switch (statusCode) {
            case StatusCode.NOT_FOUND: {
                res.sendStatus(404);
                return
            }
            case StatusCode.NO_CONTENT: {
                res.sendStatus(204)
                return
            }
        }
    })

postsRouter.get('/:id/comments',
    async (req: RequestWithParamsAndQuery<QueryParams>, res: ResponseWithBody<Paginator<CommentViewModel[]>>) => {
        const {id} = req.params
        const {sortBy, sortDirection, pageNumber, pageSize} = req.query
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const sortParams = {
            sortBy: sortBy ?? 'createdAt',
            sortDirection: sortDirection ?? 'desc',
            pageNumber: pageNumber ? +pageNumber : 1,
            pageSize: pageSize ? +pageSize : 10,
        }
        const comments = await CommentsQueryRepository.getCommentsByPostId(id, sortParams)
        comments
            ? res.status(200).send(comments)
            : res.sendStatus(404)
    })

postsRouter.post('/:id/comments', accessTokenGuard, commentValidator(),
    async (req: RequestWithParamsAndBody<CommentInputModel>, res: ResponseWithBody<CommentViewModel>) => {
        const {id: postId} = req.params
        const {content} = req.body
        const {id: userId} = req.user
        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }
        const {statusCode, data} = await CommentsService.createComment(postId, userId, content)
        switch (statusCode) {
            case StatusCode.NOT_FOUND: {
                res.sendStatus(404)
                return
            }
            case StatusCode.SERVER_ERROR: {
                res.sendStatus(500)
                return
            }
            case StatusCode.SUCCESS: {
                res.status(201).send(data)
                return
            }
        }
    })

