import {model, Model, Schema} from "mongoose";
import {CommentDBModel, LikeEntityDBModel} from "../../../repositories/types";
import {LikeModel} from "./like.model";
import {ObjectId} from "mongodb";

export type CommentsInstanceMethods = {
    addLike(commentId: string, like: LikeEntityDBModel): string | null
    addDislike(commentId: string, dislike: LikeEntityDBModel): string | null
    removeLike(commentId: string, userId: string): boolean
    removeDislike(commentId: string, userId: string): boolean
    increaseLikesCount(commentId: string): boolean
    increaseDislikesCount(commentId: string): boolean
    decreaseLikesCount(commentId: string): boolean
    decreaseDislikesCount(commentId: string): boolean
}

type CommentModelType = Model<CommentDBModel, {}, CommentsInstanceMethods>;

export const CommentSchema = new Schema<CommentDBModel, CommentModelType, CommentsInstanceMethods>({
    content: {type: String, required: true},
    commentatorInfo: {
        userId: {type: String, required: true},
        userLogin: {type: String, required: true},
    },
    postId: {type: String, required: true},
    createdAt: {type: String, required: true},
    likesInfo: {
        likesCount: {type: Number, required: true},
        dislikesCount: {type: Number, required: true},
    }
})

CommentSchema.method('addLike', async function addLike(commentId: string, like: LikeEntityDBModel): Promise<string | null> {
    try {
        this.increaseLikesCount(commentId)
        const newLike = new LikeModel(like)
        await newLike.save()
        return newLike._id.toString()
    } catch (e) {
        console.error(e)
        return null
    }
});
CommentSchema.method('addDislike', async function addDislike(commentId: string, dislike: LikeEntityDBModel): Promise<string | null> {
    try {
        this.increaseDislikesCount(commentId)
        const newDislike = new LikeModel(dislike)
        await newDislike.save()
        return newDislike._id.toString()
    } catch (e) {
        console.error(e)
        return null
    }
});
CommentSchema.method('removeLike', async function removeLike(commentId: string, userId: string): Promise<boolean> {
    try {
        this.decreaseLikesCount(commentId)
        const res = await LikeModel.deleteOne({commentId, userId})
        return res.deletedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
CommentSchema.method('removeDislike', async function removeDislike(commentId: string, userId: string): Promise<boolean> {
    try {
        this.decreaseDislikesCount(commentId)
        const res = await LikeModel.deleteOne({commentId, userId})
        return res.deletedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});

CommentSchema.method('increaseLikesCount', async function increaseLikesCount(commentId: string): Promise<boolean> {
    try {
        const res = await CommentModel.updateOne(
            {_id: new ObjectId(commentId)},
            { $inc: {"likesInfo.likesCount": 1 }},
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
CommentSchema.method('increaseDislikesCount', async function increaseDislikesCount(commentId: string): Promise<boolean> {
    try {
        const res = await CommentModel.updateOne(
            {_id: new ObjectId(commentId)},
            { $inc: {"likesInfo.dislikesCount": 1 }}
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
CommentSchema.method('decreaseLikesCount', async function decreaseLikesCount(commentId: string): Promise<boolean> {
    try {
        const res = await CommentModel.updateOne(
            {_id: new ObjectId(commentId)},
            { $inc: {"likesInfo.likesCount": -1 }}
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
CommentSchema.method('decreaseDislikesCount', async function decreaseDislikesCount(commentId: string): Promise<boolean> {
    try {
        const res = await CommentModel.updateOne(
            {_id: new ObjectId(commentId)},
            { $inc: {"likesInfo.dislikesCount": -1 }}
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});

export const CommentModel = model<CommentDBModel, CommentModelType>('comment', CommentSchema)



