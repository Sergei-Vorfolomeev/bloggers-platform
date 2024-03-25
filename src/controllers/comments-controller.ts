import {CommentsService} from "../services";
import {CommentsQueryRepository} from "../repositories";
import {
    CommentInputModel,
    RequestWithParams,
    RequestWithParamsAndBody,
    ResponseType,
    ResponseWithBody
} from "../routers/types";
import {CommentViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {StatusCode} from "../utils/result";
import {inject, injectable} from "inversify";

@injectable()
export class CommentsController {
    constructor(
        @inject(CommentsService) protected commentsService: CommentsService,
        @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository,
    ) {}

    async getCommentById(req: RequestWithParams, res: ResponseWithBody<CommentViewModel>) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const comment = await this.commentsQueryRepository.getCommentById(id)
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