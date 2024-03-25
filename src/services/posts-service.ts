import {PostInputModel} from "../routers/types";
import {PostDBModel} from "../repositories/types";
import {PostsRepository, BlogsRepository} from "../repositories";
import {Result, StatusCode} from "../utils/result";
import {ErrorsMessages, FieldError} from "../utils/errors-messages";
import {inject, injectable} from "inversify";

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository,
    ) {
    }
    async createPost(inputData: PostInputModel): Promise<Result<string>> {
        const {title, shortDescription, content, blogId} = inputData
        const blog = await this.blogsRepository.getBlogById(blogId)
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
        const createdPostId = await this.postsRepository.createPost(newPost)
        if (!createdPostId) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Created, null, createdPostId)
    }

    async updatePost(id: string, inputData: PostInputModel): Promise<Result> {
        const {title, shortDescription, content, blogId} = inputData
        const post = await this.postsRepository.getPostById(id)
        if (!post) {
            return new Result(StatusCode.NotFound)
        }
        const newPost = {
            ...post,
            title, shortDescription, content, blogId
        }
        const isUpdated = await this.postsRepository.updatePost(id, newPost)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }

    async deletePost(id: string): Promise<Result> {
        const isDeleted = await this.postsRepository.deletePost(id)
        if (!isDeleted) {
            return new Result(StatusCode.NotFound)
        }
        return new Result(StatusCode.NoContent)
    }
}