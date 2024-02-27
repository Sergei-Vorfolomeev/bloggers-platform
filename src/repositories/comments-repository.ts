import {CommentDBModel} from "./types";
import {ObjectId, WithId} from "mongodb";
import {CommentModel} from "./models/comment.model";

export class CommentsRepository {

    static async getCommentById(commentId: string): Promise<WithId<CommentDBModel> | null> {
        try {
            return CommentModel.findById(new ObjectId(commentId)).lean().exec()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static async createComment(comment: CommentDBModel): Promise<string | null> {
        try {
            const newComment = new CommentModel(comment)
            await newComment.save()
            return newComment._id.toString()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static async updateComment(id: string, updatedComment: CommentDBModel): Promise<boolean> {
        try {
            const res = await CommentModel.updateOne(
                {_id: new ObjectId(id)},
                updatedComment
            )
            return res.matchedCount === 1
        } catch (error) {
            console.error(error)
            return false
        }
    }

    static async deleteCommentById(id: string): Promise<boolean> {
        try {
            const res = await CommentModel.deleteOne({_id: new ObjectId(id)})
            return res.deletedCount === 1
        } catch (error) {
            console.error(error)
            return false
        }
    }
}