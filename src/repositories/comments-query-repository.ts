import {CommentViewModel} from "../services/types";
import {commentsCollection} from "../db/db";
import {ObjectId} from "mongodb";
import {commentMapper} from "../utils/comment-mapper";
import {PostsQueryRepository} from "./posts-query-repository";
import {Paginator} from "../routers/types";
import {SortParams} from "./types";

export class CommentsQueryRepository {
    static async getCommentById(id: string): Promise<CommentViewModel | null> {
        try {
            const comment = await commentsCollection.findOne({_id: new ObjectId(id)})
            if (!comment) {
                return null
            }
            return commentMapper(comment)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static async getCommentsByPostId(id: string, sortParams: SortParams): Promise<Paginator<CommentViewModel[]> | null> {
        try {
            const {sortBy, sortDirection, pageNumber, pageSize} = sortParams
            const post = await PostsQueryRepository.getPostById(id)
            if (!post) {
                return null
            }
            const comments = await commentsCollection
                .find({postId: {$eq: id}})
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort(sortBy, sortDirection)
                .toArray()
            const totalCount = await commentsCollection.countDocuments({postId: {$eq: id}})
            const pagesCount = totalCount === 0 ? 1 : totalCount / pageSize
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

