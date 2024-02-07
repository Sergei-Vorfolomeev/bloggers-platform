import {blogsCollection} from "../db/db";
import {BlogDBModel, BlogInputModel, BlogViewModel} from "../db/db.types";
import {ObjectId} from "mongodb";
import {blogMapper} from "../utils/blog-mapper";

export class blogsRepository {
    static async getBlogs(): Promise<BlogViewModel[] | null> {
        try {
            const blogs = await blogsCollection.find({}).toArray()
            return blogs.map(blogMapper)
        } catch (e) {
            console.log(e)
            return null
        }
    }

    static async getBlogById(id: string): Promise<BlogViewModel | null> {
        try {
            const blog = await blogsCollection.findOne({_id: new ObjectId(id)})
            if (!blog) return null
            return blogMapper(blog)
        } catch (e) {
            console.log(e)
            return null
        }
    }

    static async createBlog(body: BlogInputModel): Promise<BlogViewModel | null> {
        try {
            const {name, description, websiteUrl} = body
            const newBlog: BlogDBModel = {
                name, description, websiteUrl,
                createdAt: new Date().toISOString(),
                isMembership: false
            }
            const res = await blogsCollection.insertOne(newBlog)
            const blog = await this.getBlogById(res.insertedId.toString())
            if (!blog) return null
            return blog
        } catch (e) {
            console.log(e)
            return null
        }
    }

    static async updateBlog(id: string, body: BlogInputModel): Promise<boolean> {
        try {
            const {name, description, websiteUrl} = body
            const res = await blogsCollection.updateOne({_id: new ObjectId(id)}, {
                $set: {name, description, websiteUrl}
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
