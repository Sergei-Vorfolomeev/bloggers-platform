import {LikeModel} from "../db/mongoose/models/like.model";
import {LikeStatus} from "../services/types";

export class LikesQueryRepository {
    async getLikeStatus(commentOrPostId: string, userId: string | undefined): Promise<LikeStatus | null> {
        if (!userId) {
            return null
        }
        try {
            const like = await LikeModel
                .findOne()
                .or([{commentId: commentOrPostId, userId}, {postId: commentOrPostId, userId}])
                .lean()
                .exec()
            if (!like) {
                return null
            }
            return like.likeStatus
        } catch (e) {
            console.error(e)
            return null
        }
    }
}