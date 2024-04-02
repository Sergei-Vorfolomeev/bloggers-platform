import {CommentDBModel, LikeDBModel} from "../repositories/types";
import {CommentsRepository, LikesRepository, PostsRepository, UsersRepository} from "../repositories";
import {Result, StatusCode} from "../utils/result";
import {LikeStatus} from "./types";

export class CommentsService {
    constructor(
        protected commentsRepository: CommentsRepository,
        protected usersRepository: UsersRepository,
        protected postsRepository: PostsRepository,
        protected likesRepository: LikesRepository,
    ) {
    }

    async createComment(postId: string, userId: string, content: string): Promise<Result<string>> {
        const post = await this.postsRepository.getPostById(postId)
        if (!post) {
            return new Result(StatusCode.NotFound, 'The post with provided id haven\'t been found')
        }
        const user = await this.usersRepository.findUserById(userId)
        if (!user) {
            return new Result(StatusCode.NotFound, 'The user hasn\'t been found')
        }
        const newComment: CommentDBModel = {
            content,
            postId: post._id.toString(),
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
            },
        }
        const createdCommentId = await this.commentsRepository.createComment(newComment)
        if (!createdCommentId) {
            return new Result(StatusCode.ServerError, 'The comment hasn\'t been created in the DB')
        }
        return new Result(StatusCode.Success, null, createdCommentId)
    }

    async updateComment(commentId: string, userId: string, content: string): Promise<Result> {
        const comment = await this.commentsRepository.getCommentById(commentId)
        if (!comment) {
            return new Result(StatusCode.NotFound, 'The comment with provided id haven\'t been found')
        }
        if (comment.commentatorInfo.userId !== userId) {
            return new Result(StatusCode.Forbidden, 'This user does not have credentials')
        }
        const updatedComment: CommentDBModel = {
            likesInfo: comment.likesInfo,
            commentatorInfo: comment.commentatorInfo,
            postId: comment.postId,
            createdAt: comment.createdAt,
            content
        }
        const isUpdated = await this.commentsRepository.updateComment(commentId, updatedComment)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError, 'The comment hasn\'t been updated in the DB')
        }
        return new Result(StatusCode.NoContent)
    }

    async deleteComment(commentId: string, userId: string): Promise<Result> {
        const comment = await this.commentsRepository.getCommentById(commentId)
        if (!comment) {
            return new Result(StatusCode.NotFound, 'The comment with provided id haven\'t been found')
        }
        if (comment.commentatorInfo.userId !== userId) {
            return new Result(StatusCode.Forbidden, 'This user does not have credentials')
        }
        const isDeleted = await this.commentsRepository.deleteCommentById(commentId)
        if (!isDeleted) {
            return new Result(StatusCode.ServerError, 'The comment hasn\'t been deleted')
        }
        return new Result(StatusCode.NoContent)
    }

    async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<Result> {
        const comment = await this.commentsRepository.getCommentById(commentId)
        if (!comment) {
            return new Result(StatusCode.NotFound, 'The comment with provided id haven\'t been found')
        }
        // проверяем есть ли лайк юзера на комменте
        const like = await this.likesRepository.getCommentLikeStatusByUserId(userId, commentId)
        // если лайка нет -> создаем + увеличиваем счетчик в объекте коммента
        if (!like || like.likeStatus === 'None') {
            const newLike: LikeDBModel = {
                userId,
                commentId,
                likeStatus,
            }
            const createdLikeId = likeStatus === 'Like'
                ? comment.addLike(commentId, newLike)
                : comment.addDislike(commentId, newLike)
            if (!createdLikeId) {
                return new Result(StatusCode.ServerError, 'The like hasn\'t been created in the DB')
            }
            return new Result(StatusCode.NoContent)
        }
        // иначе -> обновляем статус + обновляем счетчик
        switch (like.likeStatus) {
            case 'Like': {
                const dislike = {
                    userId,
                    commentId,
                    likeStatus
                }
                comment.removeLike(commentId, userId)
                comment.addDislike(commentId, dislike)
                return new Result(StatusCode.NoContent)
            }
            case 'Dislike': {
                const like: LikeDBModel = {
                    userId,
                    commentId,
                    likeStatus,
                }
                comment.removeDislike(commentId, userId)
                comment.addLike(commentId, like)
                return new Result(StatusCode.NoContent)
            }
        }
    }
}