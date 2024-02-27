import {CommentDBModel} from "../repositories/types";
import {CommentsRepository} from "../repositories/comments-repository";
import {Result, StatusCode} from "../utils/result";
import {UsersRepository} from "../repositories/users-repository";
import {PostsRepository} from "../repositories/posts-repository";

export class CommentsService {
    static async createComment(postId: string, userId: string, content: string): Promise<Result<string>> {
        const post = await PostsRepository.getPostById(postId)
        if (!post) {
            return new Result(StatusCode.NotFound, 'The post with provided id haven\'t been found')
        }
        const user = await UsersRepository.findUserById(userId)
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
            createdAt: new Date().toISOString()
        }
        const createdCommentId = await CommentsRepository.createComment(newComment)
        if (!createdCommentId) {
            return new Result(StatusCode.ServerError, 'The comment haven\'t been created in the DB')
        }
        return new Result(StatusCode.Success, null, createdCommentId)
    }

    static async updateComment(commentId: string, userId: string, content: string): Promise<Result> {
        const comment = await CommentsRepository.getCommentById(commentId)
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
        const isUpdated =  await CommentsRepository.updateComment(commentId, updatedComment)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError, 'The comment haven\'t been updated in the DB')
        }
        return new Result(StatusCode.Success)
    }

    static async deleteComment(commentId: string, userId: string): Promise<Result> {
        const comment = await CommentsRepository.getCommentById(commentId)
        if (!comment) {
            return new Result(StatusCode.NotFound, 'The comment with provided id haven\'t been found')
        }
        if (comment.commentatorInfo.userId !== userId) {
            return new Result(StatusCode.Forbidden, 'This user does not have credentials')
        }
        const isDeleted = await CommentsRepository.deleteCommentById(commentId)
        if (!isDeleted) {
            return new Result(StatusCode.ServerError, 'The comment haven\'t been deleted')
        }
        return new Result(StatusCode.Success)
    }
}