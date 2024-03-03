import {Router} from "express";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {commentValidators} from "../validators/comment-validators";
import {commentsController} from "../composition-root";

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController))
commentsRouter.delete('/:id', accessTokenGuard, commentsController.deleteComment.bind(commentsController))
commentsRouter.put('/:id', accessTokenGuard, commentValidators(), commentsController.updateComment.bind(commentsController))