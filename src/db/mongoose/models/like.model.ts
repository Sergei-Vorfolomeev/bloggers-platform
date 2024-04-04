import mongoose from "mongoose";
import {LikeEntityDBModel} from "../../../repositories/types";

export const LikeSchema = new mongoose.Schema<LikeEntityDBModel>({
    userId: {type: String, required: true},
    login: {type: String, required: true},
    postId: String,
    commentId: String,
    likeStatus: {type: String, required: true},
    description: String,
    addedAt: {type: String, required: true},
})

export const LikeModel = mongoose.model<LikeEntityDBModel>('like', LikeSchema)