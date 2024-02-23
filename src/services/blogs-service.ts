import {BlogsRepository} from "../repositories/blogs-repository";
import {BlogDBModel} from "../repositories/types";
import {BlogInputModel, PostInputModel} from "../routers/types";
import {PostsService} from "./posts-service";
import {Result, StatusCode} from "../utils/result";

export class BlogsService {
    static async createBlog(inputData: BlogInputModel): Promise<Result<string>> {
        const {name, description, websiteUrl} = inputData
        const newBlog: BlogDBModel = {
            name, description, websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createdBlogId = await BlogsRepository.createBlog(newBlog)
        if (!createdBlogId) {
            return new Result(StatusCode.SERVER_ERROR)
        }
        return new Result(StatusCode.CREATED, null, createdBlogId)
    }

    static async updateBlog(id: string, inputData: BlogInputModel): Promise<Result> {
        const {name, description, websiteUrl} = inputData
        const blog = await BlogsRepository.getBlogById(id)
        if (!blog) {
            return new Result(StatusCode.NOT_FOUND)
        }
        const updatedBlog = {
            ...blog,
            name, description, websiteUrl
        }
        const isUpdated = await BlogsRepository.updateBlog(id, updatedBlog)
        if (!isUpdated) {
            return new Result(StatusCode.SERVER_ERROR)
        }
        return new Result(StatusCode.NO_CONTENT)
    }

    static async deleteBlog(id: string): Promise<Result> {
        const isDeleted = await BlogsRepository.deleteBlog(id)
        if (!isDeleted) {
            return new Result(StatusCode.NOT_FOUND)
        }
        return new Result(StatusCode.NO_CONTENT)
    }

    static async createPostWithinBlog(id: string, inputData: Omit<PostInputModel, 'blogId'>): Promise<Result<string>> {
        const {title, shortDescription, content} = inputData
        const blog = await BlogsRepository.getBlogById(id)
        if (!blog) {
            return new Result(StatusCode.NOT_FOUND)
        }
        const inputDataWithBlogId: PostInputModel = {
            title, shortDescription, content,
            blogId: blog._id.toString()
        }
        return await PostsService.createPost(inputDataWithBlogId)
    }
}