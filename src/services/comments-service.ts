import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {CommentDBModel} from "../repositories/types";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {CommentsRepository} from "../repositories/comments-repository";
import {CommentsQueryRepository} from "../repositories/comments-query-repository";

export class CommentsService {
    static async createComment(postId: string, userId: string, content: string) {
        const post = await PostsQueryRepository.getPostById(postId)
        if (!post) {
            return null
        }
        const user = await UsersQueryRepository.getUserById(userId)
        if (!user) {
            return null
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
            return null
        }
        const createdComment = await CommentsQueryRepository.getCommentById(createdCommentId)
        if (!createdComment) {
            return null
        }
        return createdComment
    }
}