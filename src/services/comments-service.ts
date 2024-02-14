import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {CommentDBModel} from "../repositories/types";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {CommentsRepository} from "../repositories/comments-repository";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";
import {CommentViewModel} from "./types";
import {Result, ResultCode} from "../utils/result";

export class CommentsService {
    static async createComment(postId: string, userId: string, content: string): Promise<Result<CommentViewModel>> {
        const post = await PostsQueryRepository.getPostById(postId)
        if (!post) {
            return new Result(ResultCode.NOT_FOUND, 'The post with provided id haven\'t been found')
        }
        const user = await UsersQueryRepository.getUserById(userId)
        if (!user) {
            return new Result(ResultCode.NOT_FOUND, 'The user haven\'t been found')
        }
        const newComment: CommentDBModel = {
            content,
            postId: post.id,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.login
            },
            createdAt: new Date().toISOString()
        }
        const createdCommentId = await CommentsRepository.createComment(newComment)
        if (!createdCommentId) {
            return new Result(ResultCode.SERVER_ERROR, 'The comment haven\'t been created in the DB')
        }
        const createdComment = await CommentsQueryRepository.getCommentById(createdCommentId)
        if (!createdComment) {
            return new Result(ResultCode.NOT_FOUND, 'The comment haven\'t been found in the DB')
        }
        return new Result(ResultCode.SUCCESS, null, createdComment)
    }

    static async deleteComment(id: string): Promise<boolean> {
        return await CommentsRepository.deleteCommentById(id)
    }

    static async updateComment(commentId: string, userId: string, content: string): Promise<Result> {
        const comment = await CommentsQueryRepository.getCommentById(commentId)
        if (!comment) {
            return new Result(ResultCode.NOT_FOUND, 'The comment with provided id haven\'t been found')
        }
        if (comment.commentatorInfo.userId !== userId) {
            return new Result(ResultCode.FORBIDDEN, 'This user does not have credentials')
        }
        const updatedComment: CommentViewModel = {
            ...comment,
            content
        }
        const isUpdated =  await CommentsRepository.updateComment(commentId, updatedComment)
        if (!isUpdated) {
            return new Result(ResultCode.SERVER_ERROR, 'The comment haven\'t been updated in the DB')
        }
        return new Result(ResultCode.SUCCESS, null)
    }
}