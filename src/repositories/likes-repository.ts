import {LikeEntityDBModel} from "./types";
import {LikeModel} from "../db/mongoose/models/like.model";
import {WithId} from "mongodb";

export class LikesRepository {
    async getPostLikeEntityByUserId(userId: string, postId: string): Promise<WithId<LikeEntityDBModel> | null> {
        try {
            return await LikeModel.findOne({ userId, postId }).lean().exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }
    async getCommentLikeEntityByUserId(userId: string, commentId: string): Promise<WithId<LikeEntityDBModel> | null> {
        try {
            return await LikeModel.findOne({ userId, commentId }).lean().exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }
}