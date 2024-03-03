import mongoose from "mongoose";
import {CommentDBModel} from "../../../repositories/types";

export const CommentSchema = new mongoose.Schema<CommentDBModel>({
    content: {type: String, required: true},
    commentatorInfo: {
        userId: {type: String, required: true},
        userLogin: {type: String, required: true},
    },
    postId: {type: String, required: true},
    createdAt: {type: String, required: true},
})

export const CommentModel = mongoose.model<CommentDBModel>('comment', CommentSchema)

