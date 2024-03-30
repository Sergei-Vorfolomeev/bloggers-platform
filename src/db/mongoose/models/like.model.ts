import mongoose from "mongoose";
import {LikeDBModel} from "../../../repositories/types";
import {LikeStatus} from "../../../services/types";

export const LikeSchema = new mongoose.Schema<LikeDBModel>({
    userId: {type: String, required: true},
    postId: String,
    commentId: String,
    likeStatus: {type: String, required: true}
})

export const LikeModel = mongoose.model<LikeDBModel>('like', LikeSchema)