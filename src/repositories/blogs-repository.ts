import {blogsCollection, client, commentsCollection, postsCollection} from "../db/db";
import {ObjectId, WithId} from "mongodb";
import {BlogDBModel} from "./types";
import {BlogInputModel} from "../routers/types";

export class BlogsRepository {
    static async createBlog(blog: BlogDBModel): Promise<string | null> {
        try {
            const res = await blogsCollection.insertOne(blog)
            return res.insertedId.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async updateBlog(id: string, blog: BlogInputModel): Promise<boolean> {
        try {
            const res = await blogsCollection.updateOne({_id: new ObjectId(id)}, {
                $set: blog
            })
            return !!res.matchedCount
        } catch (e) {
            console.error(e)
            return false
        }
    }

    static async deleteBlog(id: string): Promise<boolean> {
        const session = await client.startSession();
        await session.startTransaction();
        try {
            const res = await blogsCollection.deleteOne({_id: new ObjectId(id)})
            const posts = await postsCollection.find({ blogId: id }).toArray();
            for (const post of posts) {
                await commentsCollection.deleteMany({postId: post._id.toString()})
                await postsCollection.deleteOne({_id: post._id})
            }
            await session.commitTransaction();
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false
        } finally {
            await session.endSession()
        }
    }

    static async getBlogById(blogId: string): Promise<WithId<BlogDBModel> | null> {
        try {
            return await blogsCollection.findOne({_id: new ObjectId(blogId)})
        } catch (e) {
            console.error(e)
            return null
        }
    }
}
