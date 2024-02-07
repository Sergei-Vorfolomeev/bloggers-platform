import {blogsCollection} from "../db/db";
import {BlogDBModel, BlogInputModel, BlogViewModel} from "../db/db.types";
import {ObjectId} from "mongodb";
import {blogMapper} from "../utils/blog-mapper";


export class blogsRepository {
    static async getBlogs(): Promise<BlogViewModel[]> {
        const blogs = await blogsCollection.find({}).toArray()
        return blogs.map(blogMapper)
    }

    static async getBlogById(id: string): Promise<BlogViewModel | null> {
        const blog = await blogsCollection.findOne({_id: new ObjectId(id)})
        if (!blog) return null
        return blogMapper(blog)
    }

    static async createBlog(body: BlogInputModel): Promise<BlogViewModel | null> {
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
    }

    static async updateBlog(id: string, body: BlogInputModel): Promise<boolean> {
        const {name, description, websiteUrl} = body
        const res = await blogsCollection.updateOne({_id: new ObjectId(id)}, {
            $set: { name, description, websiteUrl }
        })
        return !!res.matchedCount
    }

    static async deleteBlog(id:string): Promise<boolean> {
        const res = await blogsCollection.deleteOne({_id: new ObjectId(id)})
        return !!res.deletedCount
    }
}
