import {CommentDBModel, LikeDBModel} from "../repositories/types";
import {CommentsRepository, PostsRepository, UsersRepository, LikesRepository} from "../repositories";
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
            return new Result(StatusCode.NotFound, 'The user haven\'t been found')
        }
        const newComment: CommentDBModel = {
            content,
            postId: post._id.toString(),
            commentatorInfo: {
                userId: user._id.toString(),
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
            likesCount: 0,
            dislikesCount: 0,
        }
        const createdCommentId = await this.commentsRepository.createComment(newComment)
        if (!createdCommentId) {
            return new Result(StatusCode.ServerError, 'The comment haven\'t been created in the DB')
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
            ...comment,
            content
        }
        const isUpdated = await this.commentsRepository.updateComment(commentId, updatedComment)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError, 'The comment haven\'t been updated in the DB')
        }
        return new Result(StatusCode.Success)
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
            return new Result(StatusCode.ServerError, 'The comment haven\'t been deleted')
        }
        return new Result(StatusCode.Success)
    }

    async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<Result> {
        const comment = await this.commentsRepository.getCommentById(commentId)
        if (!comment) {
            return new Result(StatusCode.NotFound, 'The comment with provided id haven\'t been found')
        }
        if (comment.commentatorInfo.userId !== userId) {
            return new Result(StatusCode.Forbidden, 'This user does not have credentials')
        }
        const newLike: LikeDBModel = {
            userId,
            commentId,
            likeStatus,
        }
        const like = await this.likesRepository.getCommentLikeByUserId(userId, commentId)
        // если лайка нет - создаем
        if (!like) {
            const createdLikeId = await this.likesRepository.create(newLike)
            if (!createdLikeId) {
                return new Result(StatusCode.ServerError, 'The like haven\'t been created in the DB')
            }
        }
        // иначе - обновляем статус
        const isUpdated = await this.likesRepository.updateLikeStatus(userId, commentId, newLike)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError, 'The like haven\'t been updated in the DB')
        }
        return new Result(StatusCode.Success)
    }
}