import {CommentDBModel, LikeDBModel} from "./types";
import {Document} from 'mongoose'
import {ObjectId} from "mongodb";
import {CommentModel, CommentsInstanceMethods} from "../db/mongoose/models/comment.model";
import {LikeStatus} from "../services/types";

export class CommentsRepository {

     async getCommentById(commentId: string): Promise<CommentDBModel & Document & CommentsInstanceMethods | null> {
        try {
            return CommentModel.findById(new ObjectId(commentId)).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async createComment(comment: CommentDBModel): Promise<string | null> {
        try {
            const newComment = new CommentModel(comment)
            await newComment.save()
            return newComment._id.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async updateComment(id: string, updatedComment: CommentDBModel): Promise<boolean> {
        try {
            const res = await CommentModel.updateOne(
                {_id: new ObjectId(id)},
                updatedComment
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async deleteCommentById(id: string): Promise<boolean> {
        try {
            const res = await CommentModel.deleteOne({_id: new ObjectId(id)})
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async changeLikesCount(commentId: string, act: 'inc' | 'dec', likeEntity: LikeStatus): Promise<boolean>  {
        try {
            const res = await CommentModel.updateOne(
                {_id: new ObjectId(commentId)},
                { $inc:
                    likeEntity === 'Like'
                        ? {"likesInfo.likesCount": act === 'inc' ? 1 : -1 }
                        : {"likesInfo.dislikesCount": act === 'inc' ? 1 : -1 }
                }
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async addLike(commentId: string, like: LikeDBModel): Promise<string | null> {
        try {
            const comment = new CommentModel()
            console.log(comment)
            return comment.addLike(commentId, like)
        } catch (e) {
            console.error(e)
            return null
        }
    }
}