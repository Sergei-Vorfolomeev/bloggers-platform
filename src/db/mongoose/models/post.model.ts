import mongoose, {Model} from "mongoose";
import {LikeEntityDBModel, PostDBModel} from "../../../repositories/types";
import {LikeModel} from "./like.model";
import {ObjectId} from "mongodb";


export type PostsInstanceMethods = {
    addLike(postId: string, like: LikeEntityDBModel): string | null
    addDislike(postId: string, dislike: LikeEntityDBModel): string | null
    removeLike(postId: string, userId: string): boolean
    removeDislike(postId: string, userId: string): boolean
    increaseLikesCount(postId: string): boolean
    increaseDislikesCount(postId: string): boolean
    decreaseLikesCount(postId: string): boolean
    decreaseDislikesCount(postId: string): boolean
}

type PostModelType = Model<PostDBModel, {}, PostsInstanceMethods>;

export const PostSchema = new mongoose.Schema<PostDBModel, PostModelType, PostsInstanceMethods>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: String, required: true},
    likesInfo: {
        likesCount: {type: Number, required: true},
        dislikesCount: {type: Number, required: true},
    }
})

PostSchema.method('addLike', async function addLike(postId: string, like: LikeEntityDBModel): Promise<string | null> {
    try {
        this.increaseLikesCount(postId)
        const newLike = new LikeModel(like)
        await newLike.save()
        return newLike._id.toString()
    } catch (e) {
        console.error(e)
        return null
    }
});
PostSchema.method('addDislike', async function addDislike(postId: string, dislike: LikeEntityDBModel): Promise<string | null> {
    try {
        this.increaseDislikesCount(postId)
        const newDislike = new LikeModel(dislike)
        await newDislike.save()
        return newDislike._id.toString()
    } catch (e) {
        console.error(e)
        return null
    }
});
PostSchema.method('removeLike', async function removeLike(postId: string, userId: string): Promise<boolean> {
    try {
        this.decreaseLikesCount(postId)
        const res = await LikeModel.deleteOne({postId, userId})
        return res.deletedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
PostSchema.method('removeDislike', async function removeDislike(postId: string, userId: string): Promise<boolean> {
    try {
        this.decreaseDislikesCount(postId)
        const res = await LikeModel.deleteOne({postId, userId})
        return res.deletedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});

PostSchema.method('increaseLikesCount', async function increaseLikesCount(postId: string): Promise<boolean> {
    try {
        const res = await PostModel.updateOne(
            {_id: new ObjectId(postId)},
            { $inc: {"likesInfo.likesCount": 1 }},
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
PostSchema.method('increaseDislikesCount', async function increaseDislikesCount(postId: string): Promise<boolean> {
    try {
        const res = await PostModel.updateOne(
            {_id: new ObjectId(postId)},
            { $inc: {"likesInfo.dislikesCount": 1 }}
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
PostSchema.method('decreaseLikesCount', async function decreaseLikesCount(postId: string): Promise<boolean> {
    try {
        const res = await PostModel.updateOne(
            {_id: new ObjectId(postId)},
            { $inc: {"likesInfo.likesCount": -1 }}
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});
PostSchema.method('decreaseDislikesCount', async function decreaseDislikesCount(postId: string): Promise<boolean> {
    try {
        const res = await PostModel.updateOne(
            {_id: new ObjectId(postId)},
            { $inc: {"likesInfo.dislikesCount": -1 }}
        )
        return res.matchedCount === 1
    } catch (e) {
        console.error(e)
        return false
    }
});

export const PostModel = mongoose.model<PostDBModel, PostModelType>('post', PostSchema)