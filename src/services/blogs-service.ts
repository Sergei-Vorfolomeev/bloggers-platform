import {BlogDBModel, BlogInputModel, BlogViewModel} from "../db/db.types";
import {BlogsRepository} from "../repositories/blogs-repository";
import {BlogsQueryRepository} from "../repositories/blogs-query-repository";

export class BlogsService {
    static async createBlog(inputData: BlogInputModel): Promise<BlogViewModel | null> {
        const newBlog: BlogDBModel = {
            ...inputData,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createdBlogId = await BlogsRepository.createBlog(newBlog)
        if (!createdBlogId) {
            return null
        }
        const blog = await BlogsQueryRepository.getBlogById(createdBlogId)
        if (!blog) {
            return null
        }
        return blog
    }
    static async updateBlog(id: string, inputData: BlogInputModel): Promise<boolean | null> {
        const blog = await BlogsQueryRepository.getBlogById(id)
        if (!blog) {
            return null
        }
        const updatedBlog = {
            ...blog,
            ...inputData
        }
        return await BlogsRepository.updateBlog(id, updatedBlog)
    }
    static async deleteBlog(id: string): Promise<boolean | null> {
        return await BlogsRepository.deleteBlog(id)
    }
}