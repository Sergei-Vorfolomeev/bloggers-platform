import {CommentDBModel} from "./types";
import {commentsCollection} from "../db/db";
import {ObjectId} from "mongodb";
import {CommentViewModel} from "../services/types";

export class CommentsRepository {

    static async createComment(newComment: CommentDBModel): Promise<string | null> {
        try {
            const res = await commentsCollection.insertOne(newComment)
            return res.insertedId.toString()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static async deleteCommentById(id: string): Promise<boolean> {
        try {
            const res = await commentsCollection.deleteOne({_id: new ObjectId(id)})
            return res.deletedCount === 1
        } catch (error) {
            console.error(error)
            return false
        }
    }

    static async updateComment(id: string, updatedComment: CommentViewModel): Promise<boolean> {
        try {
            const res = await commentsCollection.updateOne(
                {_id: new ObjectId(id)},
                {$set: updatedComment}
            )
            return res.matchedCount === 1
        } catch (error) {
            console.error(error)
            return false
        }
    }
}