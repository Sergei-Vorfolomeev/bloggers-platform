import {LikeDBModel} from "./types";
import {LikeModel} from "../db/mongoose/models/like.model";
import {ObjectId, WithId} from "mongodb";
import {CommentModelType} from "../db/mongoose/models/comment.model";

export class LikesRepository {
    async getCommentLikeStatusByUserId(userId: string, commentId: string): Promise<WithId<LikeDBModel> | null> {
        try {
            return await LikeModel.findOne({ userId, commentId }).lean().exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }
}