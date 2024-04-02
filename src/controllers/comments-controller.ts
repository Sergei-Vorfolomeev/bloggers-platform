import {CommentsService, UsersService} from "../services";
import {CommentsQueryRepository, LikesQueryRepository} from "../repositories";
import {
    CommentInputModel, LikeInputModel,
    RequestWithParams,
    RequestWithParamsAndBody,
    ResponseType,
    ResponseWithBody
} from "../routers/types";
import {CommentViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {StatusCode} from "../utils/result";

export class CommentsController {
    constructor(
        protected commentsService: CommentsService,
        protected commentsQueryRepository: CommentsQueryRepository,
        protected likesQueryRepository: LikesQueryRepository,
        protected usersService: UsersService,
    ) {
    }

    async getCommentById(req: RequestWithParams, res: ResponseWithBody<CommentViewModel>) {
        const {id: commentId} = req.params
        if (!ObjectId.isValid(commentId)) {
            res.sendStatus(404)
            return
        }
        const comment = await this.commentsQueryRepository.getCommentById(commentId)
        if (!comment) {
            res.sendStatus(404)
            return
        }
        let commentView: CommentViewModel = {
            ...comment,
            likesInfo: {
                ...comment.likesInfo,
                myStatus: 'None'
            }
        }
        if (!req.headers.authorization) {
            res.status(200).send(commentView)
            return
        }
        const [, token] = req.headers.authorization.split(' ')

        const userId = await this.usersService.getUserId(token)
        if (!userId) {
            res.status(200).send(commentView)
            return
        }
        const likeStatus = await this.likesQueryRepository.getLikeStatus(commentId, userId)
        if (!likeStatus) {
            res.sendStatus(555)
            return
        }
        commentView.likesInfo.myStatus = likeStatus
        res.status(200).send(commentView)
    }

    async deleteComment(req: RequestWithParams, res: ResponseType) {
        const {id: commentId} = req.params
        const {id: userId} = req.user
        if (!ObjectId.isValid(commentId)) {
            res.sendStatus(404)
            return
        }
        const result = await this.commentsService.deleteComment(commentId, userId)
        switch (result.statusCode) {
            case StatusCode.NotFound:
                res.sendStatus(404);
                break
            case StatusCode.Forbidden:
                res.sendStatus(403);
                break
            case StatusCode.ServerError:
                res.sendStatus(555);
                break
            case StatusCode.NoContent:
                res.sendStatus(204);
                break
        }
    }

    async updateComment(req: RequestWithParamsAndBody<CommentInputModel>, res: ResponseType) {
        const {id: commentId} = req.params
        const {content} = req.body
        const {id: userId} = req.user
        if (!ObjectId.isValid(commentId)) {
            res.sendStatus(404)
            return
        }
        const result = await this.commentsService.updateComment(commentId, userId, content)
        switch (result.statusCode) {
            case StatusCode.NotFound:
                res.sendStatus(404);
                break
            case StatusCode.Forbidden:
                res.sendStatus(403);
                break
            case StatusCode.ServerError:
                res.sendStatus(555);
                break
            case StatusCode.NoContent:
                res.sendStatus(204);
                break
        }
    }

    /* TODO: validate LikeStatus */
    async updateLikeStatus(req: RequestWithParamsAndBody<LikeInputModel>, res: ResponseType) {
        const {id: commentId} = req.params
        const {likeStatus} = req.body
        const {id: userId} = req.user
        if (!ObjectId.isValid(commentId)) {
            res.sendStatus(404)
            return
        }
        const result = await this.commentsService.updateLikeStatus(commentId, userId, likeStatus)
        switch (result.statusCode) {
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
}