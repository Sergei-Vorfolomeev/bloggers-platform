import {Router} from "express";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {commentValidators, likeStatusValidator} from "../validators/comment-validators";
import {commentsController} from "../composition-root";

export const commentsRouter = Router()

commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController))
commentsRouter.delete('/:id', accessTokenGuard, commentsController.deleteComment.bind(commentsController))
commentsRouter.put('/:id', accessTokenGuard, commentValidators(), commentsController.updateComment.bind(commentsController))
commentsRouter.put('/:id/like-status', accessTokenGuard, likeStatusValidator(), commentsController.updateLikeStatus.bind(commentsController))