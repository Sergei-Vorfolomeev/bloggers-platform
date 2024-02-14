import {CommentDBModel} from "./types";
import {commentsCollection} from "../db/db";

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
}