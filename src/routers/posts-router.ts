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
import {commentValidators} from "../validators/comment-validators";
import {CommentsService} from "../services/comments-service";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {StatusCode} from "../utils/result";
import {PostsRepository} from "../repositories/posts-repository";
import {postsController} from "../composition-root";

export const postsRouter = Router()

export class PostsController {
    constructor(private postsService: PostsService, private commentsService: CommentsService) {
    }

    async getPosts(req: RequestWithQuery<QueryParams>, res: ResponseType) {
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
    }

    async getPostById(req: RequestWithParams, res: ResponseWithBody<PostViewModel>) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const post = await PostsQueryRepository.getPostById(id)
        post
            ? res.status(200).send(post)
            : res.sendStatus(404)
    }

    async createPost(req: RequestWithBody<PostInputModel>, res: ResponseWithBody<PostViewModel>) {
        const {statusCode, data: createdPostId} = await this.postsService.createPost(req.body)
        switch (statusCode) {
            case StatusCode.BadRequest: {
                res.sendStatus(400);
                return
            }
            case StatusCode.ServerError: {
                res.sendStatus(555);
                return
            }
            case StatusCode.Created: {
                const post = await PostsQueryRepository.getPostById(createdPostId!)
                post
                    ? res.status(201).send(post)
                    : res.sendStatus(400)
            }
        }
    }

    async updatePost(req: RequestWithParamsAndBody<PostInputModel>, res: ResponseType) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await this.postsService.updatePost(id, req.body)
        switch (statusCode) {
            case StatusCode.NotFound: {
                res.sendStatus(404);
                return
            }
            case StatusCode.ServerError: {
                res.sendStatus(555);
                return
            }
            case StatusCode.NoContent: {
                res.sendStatus(204)
                return
            }
        }
    }

    async deletePost(req: RequestWithParams, res: ResponseType) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await this.postsService.deletePost(id)
        switch (statusCode) {
            case StatusCode.NotFound: {
                res.sendStatus(404);
                return
            }
            case StatusCode.NoContent: {
                res.sendStatus(204)
                return
            }
        }
    }

    async getCommentByPostId(req: RequestWithParamsAndQuery<QueryParams>, res: ResponseWithBody<Paginator<CommentViewModel[]>>) {
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
    }

    async createComment(req: RequestWithParamsAndBody<CommentInputModel>, res: ResponseWithBody<CommentViewModel>) {
        const {id: postId} = req.params
        const {content} = req.body
        const {id: userId} = req.user
        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }
        const {statusCode, data: createdCommentId} = await this.commentsService.createComment(postId, userId, content)
        switch (statusCode) {
            case StatusCode.NotFound: {
                res.sendStatus(404)
                return
            }
            case StatusCode.ServerError: {
                res.sendStatus(500)
                return
            }
            case StatusCode.Success: {
                const createdComment = await CommentsQueryRepository.getCommentById(createdCommentId!)
                createdComment
                    ? res.status(201).send(createdComment)
                    : res.sendStatus(404)
            }
        }
    }
}

postsRouter.get('/', postsController.getPosts)
postsRouter.get('/:id', postsController.getPostById)
postsRouter.post('/', basicAuthGuard, postValidators(), postsController.createPost)
postsRouter.put('/:id', basicAuthGuard, postValidators(), postsController.updatePost)
postsRouter.delete('/:id', basicAuthGuard, postsController.deletePost)
postsRouter.get('/:id/comments', postsController.getCommentByPostId)
postsRouter.post('/:id/comments', accessTokenGuard, commentValidators(), postsController.createComment)

