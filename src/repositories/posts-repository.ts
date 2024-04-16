import {ObjectId} from "mongodb";
import {PostDBModel} from "./types";
import {PostInputModel} from "../routers/types";
import {PostModel, PostsInstanceMethods} from "../db/mongoose/models/post.model";
import mongoose, {Document} from "mongoose";
import {CommentModel} from "../db/mongoose/models/comment.model";

export class PostsRepository {
    async getPostById(postId: string): Promise<PostDBModel & Document & PostsInstanceMethods | null> {
        try {
            return await PostModel.findById(new ObjectId(postId)).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async createPost(post: PostDBModel): Promise<string | null> {
        try {
            const newPost = new PostModel(post)
            await newPost.save()
            return newPost._id.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async updatePost(id: string, post: PostInputModel): Promise<boolean> {
        try {
            const res = await PostModel.updateOne({_id: new ObjectId(id)}, post)
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async deletePost(id: string): Promise<boolean> {
        const session = await mongoose.startSession()
        await session.startTransaction()
        try {
            const res = await PostModel.deleteOne({_id: new ObjectId(id)})
            await CommentModel.deleteMany({postId: id})
            await session.commitTransaction()
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            await session.abortTransaction()
            return false
        } finally {
            await session.endSession()
        }
    }
}