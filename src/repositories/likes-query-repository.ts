import {LikeModel} from "../db/mongoose/models/like.model";
import {LikeDetailsViewModel, LikeStatus} from "../services/types";

export class LikesQueryRepository {
    async getCommentLikeStatus(commentId: string, userId: string): Promise<LikeStatus | null> {
        try {
            const like = await LikeModel.findOne({commentId, userId}).lean().exec()
            if (!like) {
                return null
            }
            return like.likeStatus
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async getPostLikeStatus(postId: string, userId: string): Promise<LikeStatus | null> {
        try {
            const like = await LikeModel.findOne({postId, userId}).lean().exec()
            if (!like) {
                return null
            }
            return like.likeStatus
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async getNewestLikes(postId: string): Promise<LikeDetailsViewModel[] | null> {
        try {
            const newestLikes = await LikeModel.find({postId, likeStatus: "Like"})
                .sort({addedAt: -1})
                .limit(3)
                .lean().exec()
            return newestLikes.map(el => ({
                userId: el.userId,
                login: el.login,
                addedAt: el.addedAt,
            }))

        } catch (e) {
            console.error(e)
            return null
        }
    }
}