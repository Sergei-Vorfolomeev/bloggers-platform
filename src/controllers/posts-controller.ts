import {CommentsService, PostsService, UsersService} from "../services";
import {CommentsQueryRepository, PostsQueryRepository} from "../repositories";
import {
    CommentInputModel,
    LikeInputModel,
    Paginator,
    PostInputModel,
    QueryParams,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery,
    ResponseType,
    ResponseWithBody
} from "../routers/types";
import {CommentViewModel, PostViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {StatusCode} from "../utils/result";

export class PostsController {
    constructor(
        protected postsService: PostsService,
        protected commentsService: CommentsService,
        protected postsQueryRepository: PostsQueryRepository,
        protected commentsQueryRepository: CommentsQueryRepository,
        protected usersService: UsersService,
    ) {
    }

    async getPosts(req: RequestWithQuery<QueryParams>, res: ResponseType) {
        const {sortBy, sortDirection, pageNumber, pageSize} = req.query
        let userId = null
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = await this.usersService.getUserId(token)
        }
        const sortParams = {
            sortBy: sortBy ?? 'createdAt',
            sortDirection: sortDirection ?? 'desc',
            pageNumber: pageNumber ? +pageNumber : 1,
            pageSize: pageSize ? +pageSize : 10,
        }
        const posts = await this.postsQueryRepository.getPosts(sortParams, userId)
        posts
            ? res.status(200).send(posts)
            : res.sendStatus(500)
    }

    async getPostById(req: RequestWithParams, res: ResponseWithBody<PostViewModel>) {
        const {id: postId} = req.params
        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }
        let userId = null
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = await this.usersService.getUserId(token)
        }
        const post = await this.postsQueryRepository.getPostById(postId, userId)
        post
            ? res.status(200).send(post)
            : res.sendStatus(404)
    }

    async createPost(req: RequestWithBody<PostInputModel>, res: ResponseWithBody<PostViewModel>) {
        const {statusCode, data: createdPostId} = await this.postsService.createPost(req.body)
        let userId = null
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = await this.usersService.getUserId(token)
        }
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
                const post = await this.postsQueryRepository.getPostById(createdPostId!, userId)
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

    async updateLikeStatus(req: RequestWithParamsAndBody<LikeInputModel>, res: ResponseType) {
        const {id: postId} = req.params
        const {likeStatus} = req.body
        const {id: userId} = req.user
        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }
        const result = await this.postsService.updateLikeStatus(postId, userId, likeStatus)
        switch (result.statusCode) {
            case StatusCode.Unauthorized:
                res.sendStatus(401);
                break
            case StatusCode.NotFound:
                res.sendStatus(404);
                break
            case StatusCode.ServerError:
                res.sendStatus(555);
                break
            case StatusCode.NoContent:
                res.sendStatus(204);
                break
        }
    }

    async getCommentByPostId(req: RequestWithParamsAndQuery<QueryParams>, res: ResponseWithBody<Paginator<CommentViewModel[]>>) {
        const {id: postId} = req.params
        const {sortBy, sortDirection, pageNumber, pageSize} = req.query
        if (!ObjectId.isValid(postId)) {
            res.sendStatus(404)
            return
        }
        const sortParams = {
            sortBy: sortBy ?? 'createdAt',
            sortDirection: sortDirection ?? 'desc',
            pageNumber: pageNumber ? +pageNumber : 1,
            pageSize: pageSize ? +pageSize : 10,
        }
        let userId = null
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = await this.usersService.getUserId(token)
        }
        const comments = await this.commentsQueryRepository.getCommentsByPostId(postId, sortParams, userId)
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
                const createdComment = await this.commentsQueryRepository.getCommentById(createdCommentId!, userId)
                createdComment
                    ? res.status(201).send(createdComment)
                    : res.sendStatus(404)
            }
        }
    }
}