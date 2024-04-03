import {WithId} from "mongodb";
import {CommentDBModel} from "../repositories/types";
import {CommentViewModel} from "../services/types";
import {likesQueryRepository} from "../composition-root";

export const commentMapper = async (comment: WithId<CommentDBModel>, userId: string | null): Promise<CommentViewModel> => {
    let status
    if (userId) {
        status = await likesQueryRepository.getLikeStatus(comment._id.toString(), userId)
    }
    return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: {
            likesCount: comment.likesInfo.likesCount,
            dislikesCount: comment.likesInfo.dislikesCount,
            myStatus: status ?? 'None',
        }
    }
}