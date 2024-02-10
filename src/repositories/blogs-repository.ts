import {blogsCollection, postsCollection} from "../db/db";
import {ObjectId} from "mongodb";
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
        try {
            const res = await blogsCollection.deleteOne({_id: new ObjectId(id)})
            if (res.deletedCount === 0) {
                return false
            }
            await postsCollection.deleteMany({blogId: id})
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }
}
