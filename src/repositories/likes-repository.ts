import {LikeDBModel} from "./types";
import {LikeModel} from "../db/mongoose/models/like.model";
import {ObjectId, WithId} from "mongodb";
import {CommentModel} from "../db/mongoose/models/comment.model";

export class LikesRepository {
    async getCommentLikeStatusByUserId(userId: string, commentId: string): Promise<WithId<LikeDBModel> | null> {
        try {
            return await LikeModel.findOne({ userId, commentId }).lean().exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async create(like: LikeDBModel): Promise<string | null> {
        try {
            const newLike = new LikeModel(like)
            await newLike.save()
            return newLike._id.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async updateLikeStatus(userId: string, commentId: string, newLike: LikeDBModel): Promise<boolean> {
        try {
            const res = await LikeModel.updateOne(
                { userId, commentId },
                newLike
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }
}