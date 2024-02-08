import {blogsCollection} from "../db/db";
import {BlogDBModel, BlogInputModel, BlogViewModel} from "../db/db.types";
import {ObjectId} from "mongodb";

export class BlogsRepository {
    static async createBlog(blog: BlogDBModel): Promise<string | null> {
        try {
            const res = await blogsCollection.insertOne(blog)
            return res.insertedId.toString()
        } catch (e) {
            console.log(e)
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
            console.log(e)
            return false
        }
    }

    static async deleteBlog(id: string): Promise<boolean> {
        try {
            const res = await blogsCollection.deleteOne({_id: new ObjectId(id)})
            return !!res.deletedCount
        } catch (e) {
            console.log(e)
            return false
        }
    }
}
