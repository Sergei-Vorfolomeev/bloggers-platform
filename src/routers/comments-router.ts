import {Router} from "express";
import {RequestWithParams, ResponseWithBody, ResponseType, RequestWithParamsAndBody, CommentInputModel} from "./types";
import {CommentViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";
import {CommentsService} from "../services/comments-service";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {StatusCode} from "../utils/result";
import {commentValidator} from "../validators/comment-validator";

export const commentsRouter = Router()

commentsRouter.get('/:id',
    async (req: RequestWithParams, res: ResponseWithBody<CommentViewModel>) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const comment = await CommentsQueryRepository.getCommentById(id)
        comment
            ? res.status(200).send(comment)
            : res.sendStatus(404)
    })

commentsRouter.delete('/:id', accessTokenGuard,
    async (req: RequestWithParams, res: ResponseType) => {
        const {id: commentId} = req.params
        const {id: userId} = req.user
        if (!ObjectId.isValid(commentId)) {
            res.sendStatus(404)
            return
        }
        const result = await CommentsService.deleteComment(commentId, userId)
        switch(result.statusCode) {
            case StatusCode.NotFound: res.sendStatus(404); break
            case StatusCode.Forbidden: res.sendStatus(403); break
            case StatusCode.ServerError: res.sendStatus(500); break
            case StatusCode.Success: res.sendStatus(204); break
        }
    })

commentsRouter.put('/:id', accessTokenGuard, commentValidator(),
    async (req: RequestWithParamsAndBody<CommentInputModel>, res: ResponseType) => {
        const {id: commentId} = req.params
        const {content} = req.body
        const {id: userId} = req.user
        if (!ObjectId.isValid(commentId)) {
            res.sendStatus(404)
            return
        }
        const result = await CommentsService.updateComment(commentId, userId, content)
        switch (result.statusCode) {
            case StatusCode.NotFound: res.sendStatus(404); break
            case StatusCode.Forbidden: res.sendStatus(403); break
            case StatusCode.ServerError: res.sendStatus(500); break
            case StatusCode.Success: res.sendStatus(204); break
        }
    })