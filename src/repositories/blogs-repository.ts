import {ObjectId, WithId} from "mongodb";
import {BlogDBModel} from "./types";
import {BlogInputModel} from "../routers/types";
import {BlogModel} from "../db/mongoose/models/blog.model";
import mongoose from "mongoose";
import {PostModel} from "../db/mongoose/models/post.model";
import {CommentModel} from "../db/mongoose/models/comment.model";

export class BlogsRepository {
    async getBlogById(blogId: string): Promise<WithId<BlogDBModel> | null> {
        try {
            return BlogModel.findById(new ObjectId(blogId)).lean().exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async createBlog(blog: BlogDBModel): Promise<string | null> {
        try {
            const newBlog = new BlogModel(blog)
            await newBlog.save()
            return newBlog._id.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async updateBlog(id: string, blog: BlogInputModel): Promise<boolean> {
        try {
            const res = await BlogModel.updateOne({_id: new ObjectId(id)}, blog)
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async deleteBlog(id: string): Promise<boolean> {
        const session = await mongoose.startSession();
        await session.startTransaction();
        try {
            const res = await BlogModel.deleteOne({_id: new ObjectId(id)})
            const posts = await PostModel.find().where('blogId').equals(id).exec();
            for (const post of posts) {
                await CommentModel.deleteMany({postId: post._id.toString()})
                await PostModel.deleteOne({_id: post._id})
            }
            await session.commitTransaction();
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
