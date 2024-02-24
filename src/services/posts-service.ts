import {PostInputModel} from "../routers/types";
import {PostDBModel} from "../repositories/types";
import {PostsRepository} from "../repositories/posts-repository";
import {BlogsRepository} from "../repositories/blogs-repository";
import {Result, StatusCode} from "../utils/result";
import {ErrorsMessages, FieldError} from "../utils/errors-messages";

export class PostsService {
    static async createPost(inputData: PostInputModel): Promise<Result<string>> {
        const {title, shortDescription, content, blogId} = inputData
        const blog = await BlogsRepository.getBlogById(blogId)
        if (!blog) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('blogId', 'This blog doesn\'t exist'))
            )
        }
        const newPost: PostDBModel = {
            title, shortDescription, content, blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        }
        const createdPostId = await PostsRepository.createPost(newPost)
        if (!createdPostId) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Created, null, createdPostId)
    }

    static async updatePost(id: string, inputData: PostInputModel): Promise<Result> {
        const {title, shortDescription, content, blogId} = inputData
        const post = await PostsRepository.getPostById(id)
        if (!post) {
            return new Result(StatusCode.NotFound)
        }
        const newPost = {
            ...post,
            title, shortDescription, content, blogId
        }
        const isUpdated = await PostsRepository.updatePost(id, newPost)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }

    static async deletePost(id: string): Promise<Result> {
        const isDeleted = await PostsRepository.deletePost(id)
        if (!isDeleted) {
            return new Result(StatusCode.NotFound)
        }
        return new Result(StatusCode.NoContent)
    }
}