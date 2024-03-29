import {Router} from "express";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {commentValidators} from "../validators/comment-validators";
import {container} from "../composition-root";
import {CommentsController} from "../controllers";

export const commentsRouter = Router()

const commentsController = container.resolve(CommentsController)

commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController))
commentsRouter.delete('/:id', accessTokenGuard, commentsController.deleteComment.bind(commentsController))
commentsRouter.put('/:id', accessTokenGuard, commentValidators(), commentsController.updateComment.bind(commentsController))