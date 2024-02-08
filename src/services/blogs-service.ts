import {BlogsRepository} from "../repositories/blogs-repository";
import {BlogsQueryRepository} from "../repositories/blogs-query-repository";
import {BlogDBModel} from "../repositories/types";
import {BlogInputModel, PostInputModel} from "../routers/types";
import {BlogViewModel, PostViewModel} from "./types";
import {PostsService} from "./posts-service";

export class BlogsService {
    static async createBlog(inputData: BlogInputModel): Promise<BlogViewModel | null> {
        const {name, description, websiteUrl} = inputData
        const newBlog: BlogDBModel = {
            name, description, websiteUrl,
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
    static async deleteBlog(id: string): Promise<boolean> {
        return await BlogsRepository.deleteBlog(id)
    }
    static async createPostWithinBlog(id: string, inputData: Omit<PostInputModel, 'blogId'>): Promise<PostViewModel | null> {
        const blog = await BlogsQueryRepository.getBlogById(id)
        if (!blog) {
            return null
        }
        const inputDataWithBlogId: PostInputModel = {
            ...inputData,
            blogId: blog.id
        }
        return await PostsService.createPost(inputDataWithBlogId)
    }
}