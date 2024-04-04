import {Router} from "express";
import {basicAuthGuard} from "../middlewares/basic-auth-guard";
import {postValidators} from "../validators/post-validators";
import {commentValidators, likeStatusValidator} from "../validators/comment-validators";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {postsController} from "../composition-root";

export const postsRouter = Router()

postsRouter.get('/', postsController.getPosts.bind(postsController))
postsRouter.get('/:id', postsController.getPostById.bind(postsController))
postsRouter.post('/', basicAuthGuard, postValidators(), postsController.createPost.bind(postsController))
postsRouter.put('/:id', basicAuthGuard, postValidators(), postsController.updatePost.bind(postsController))
postsRouter.delete('/:id', basicAuthGuard, postsController.deletePost.bind(postsController))
postsRouter.put('/:id/like-status', accessTokenGuard, likeStatusValidator(), postsController.updateLikeStatus.bind(postsController))
postsRouter.get('/:id/comments', postsController.getCommentByPostId.bind(postsController))
postsRouter.post('/:id/comments', accessTokenGuard, commentValidators(), postsController.createComment.bind(postsController))

