import {BlogsRepository} from "../repositories/blogs-repository";
import {BlogDBModel} from "../repositories/types";
import {BlogInputModel, PostInputModel} from "../routers/types";
import {PostsService} from "./posts-service";
import {Result, StatusCode} from "../utils/result";

export class BlogsService {
    constructor(private blogsRepository: BlogsRepository, private postsService: PostsService) {
    }
    async createBlog(inputData: BlogInputModel): Promise<Result<string>> {
        const {name, description, websiteUrl} = inputData
        const newBlog: BlogDBModel = {
            name, description, websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createdBlogId = await this.blogsRepository.createBlog(newBlog)
        if (!createdBlogId) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Created, null, createdBlogId)
    }

    async updateBlog(id: string, inputData: BlogInputModel): Promise<Result> {
        const {name, description, websiteUrl} = inputData
        const blog = await this.blogsRepository.getBlogById(id)
        if (!blog) {
            return new Result(StatusCode.NotFound)
        }
        const updatedBlog = {
            ...blog,
            name, description, websiteUrl
        }
        const isUpdated = await this.blogsRepository.updateBlog(id, updatedBlog)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }

    async deleteBlog(id: string): Promise<Result> {
        const isDeleted = await this.blogsRepository.deleteBlog(id)
        if (!isDeleted) {
            return new Result(StatusCode.NotFound)
        }
        return new Result(StatusCode.NoContent)
    }

    async createPostWithinBlog(id: string, inputData: Omit<PostInputModel, 'blogId'>): Promise<Result<string>> {
        const {title, shortDescription, content} = inputData
        const blog = await this.blogsRepository.getBlogById(id)
        if (!blog) {
            return new Result(StatusCode.NotFound)
        }
        const inputDataWithBlogId: PostInputModel = {
            title, shortDescription, content,
            blogId: blog._id.toString()
        }
        return await this.postsService.createPost(inputDataWithBlogId)
    }
}