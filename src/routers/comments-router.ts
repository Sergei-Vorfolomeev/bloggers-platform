import {Router} from "express";
import {RequestWithParams, ResponseWithBody} from "./types";
import {CommentViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";

export const commentsRouter = Router()

commentsRouter.get('/:id', async (req: RequestWithParams, res: ResponseWithBody<CommentViewModel>) => {
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