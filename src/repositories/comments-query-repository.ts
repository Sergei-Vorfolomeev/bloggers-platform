import {CommentViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {commentMapper} from "../utils/comment-mapper";
import {PostsQueryRepository} from "./posts-query-repository";
import {Paginator} from "../routers/types";
import {SortParams} from "./types";
import {CommentModel} from "../db/mongoose/models/comment.model";

export class CommentsQueryRepository {
    constructor(protected postsQueryRepository: PostsQueryRepository) {
    }

    async getCommentById(id: string): Promise<CommentViewModel | null> {
        try {
            const comment = await CommentModel.findById(new ObjectId(id)).lean().exec()
            if (!comment) {
                return null
            }
            return commentMapper(comment)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async getCommentsByPostId(postId: string, sortParams: SortParams): Promise<Paginator<CommentViewModel[]> | null> {
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
                items: comments.map(commentMapper),
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
}

