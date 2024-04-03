import {CommentViewModel} from "../services/types";
import {ObjectId, WithId} from "mongodb";
import {PostsQueryRepository} from "./posts-query-repository";
import {Paginator} from "../routers/types";
import {CommentDBModel, SortParams} from "./types";
import {CommentModel} from "../db/mongoose/models/comment.model";
import {LikesQueryRepository} from "./likes-query-repository";

export class CommentsQueryRepository {
    constructor(
        protected postsQueryRepository: PostsQueryRepository,
        protected likesQueryRepository: LikesQueryRepository,
    ) {
    }

    async getCommentById(id: string): Promise<CommentViewModel | null> {
        try {
            const comment = await CommentModel.findById(new ObjectId(id)).lean().exec()
            if (!comment) {
                return null
            }
            const res = await this.mapToView([comment], null)
            return res[0]
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async getCommentsByPostId(postId: string, sortParams: SortParams, userId: string | null): Promise<Paginator<CommentViewModel[]> | null> {
        try {
            const {sortBy, sortDirection, pageNumber, pageSize} = sortParams
            const post = await this.postsQueryRepository.getPostById(postId)
            if (!post) {
                return null
            }
            const comments = await CommentModel
                .where('postId').equals(postId)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort({[sortBy]: sortDirection})
                .lean()
                .exec()
            const totalCount = await CommentModel.countDocuments().where('postId').equals(postId)
            const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
            return {
                items: await this.mapToView(comments, userId),
                page: pageNumber,
                pageSize,
                pagesCount,
                totalCount,
            }
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async mapToView(comments: WithId<CommentDBModel>[], userId: string | null): Promise<CommentViewModel[]> {
        return await Promise.all(comments.map(async comment => {
            let status
            if (userId) {
                status = await this.likesQueryRepository.getLikeStatus(comment._id.toString(), userId)
            }
            return {
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: comment.commentatorInfo,
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus: status ?? 'None',
                }
            }
        }))
    }
}

