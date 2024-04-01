import {WithId} from "mongodb";
import {CommentDBModel} from "../repositories/types";
import {CommentViewModel} from "../services/types";

export const commentMapper = (comment: WithId<CommentDBModel>): CommentViewModel => {
    return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: {
            likesCount: comment.likesInfo.likesCount,
            dislikesCount: comment.likesInfo.dislikesCount,
            myStatus: 'None',
        }
    }
}