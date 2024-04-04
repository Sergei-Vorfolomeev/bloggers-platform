import {CommentViewModel, LikeStatus} from "../services/types";
import {ObjectId, WithId} from "mongodb";
import {PostsQueryRepository, LikesQueryRepository} from "../repositories";
import {Paginator} from "../routers/types";
import {CommentDBModel, SortParams} from "./types";
import {CommentModel} from "../db/mongoose/models/comment.model";

export class CommentsQueryRepository {
    constructor(
        protected postsQueryRepository: PostsQueryRepository,
        protected likesQueryRepository: LikesQueryRepository,
    ) {
    }

    async getCommentById(id: string, userId: string | null): Promise<CommentViewModel | null> {
        try {
            const comment = await CommentModel.findById(new ObjectId(id)).lean().exec()
            if (!comment) {
                return null
            }
            const res = await this.mapToView([comment], userId)
            return res[0]
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async getCommentsByPostId(postId: string, sortParams: SortParams, userId: string | null): Promise<Paginator<CommentViewModel[]> | null> {
        try {
            const {sortBy, sortDirection, pageNumber, pageSize} = sortParams
            const post = await this.postsQueryRepository.getPostById(postId, userId)
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
            let likeStatus: LikeStatus | null = null
            if (userId) {
                likeStatus = await this.likesQueryRepository.getCommentLikeStatus(comment._id.toString(), userId)
            }
            return {
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: comment.commentatorInfo,
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus: likeStatus ?? 'None',
                }
            }
        }))
    }
}

