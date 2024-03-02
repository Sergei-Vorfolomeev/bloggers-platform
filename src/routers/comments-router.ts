import {Router} from "express";
import {RequestWithParams, ResponseWithBody, ResponseType, RequestWithParamsAndBody, CommentInputModel} from "./types";
import {CommentViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";
import {CommentsService} from "../services/comments-service";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {StatusCode} from "../utils/result";
import {commentValidators} from "../validators/comment-validators";
import {commentsController} from "../composition-root";

export const commentsRouter = Router()

export class CommentsController {
    constructor(private commentsService: CommentsService) {
    }

    async getCommentById(req: RequestWithParams, res: ResponseWithBody<CommentViewModel>) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const comment = await CommentsQueryRepository.getCommentById(id)
        comment
            ? res.status(200).send(comment)
            : res.sendStatus(404)
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
                res.sendStatus(500);
                break
            case StatusCode.Success:
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
                res.sendStatus(500);
                break
            case StatusCode.Success:
                res.sendStatus(204);
                break
        }
    }
}

commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsRouter))
commentsRouter.delete('/:id', accessTokenGuard, commentsController.deleteComment.bind(commentsRouter))
commentsRouter.put('/:id', accessTokenGuard, commentValidators(), commentsController.updateComment.bind(commentsRouter))