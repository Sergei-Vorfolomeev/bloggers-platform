import {PostInputModel} from "../routers/types";
import {PostViewModel} from "./types";
import {PostDBModel} from "../repositories/types";
import {BlogsQueryRepository} from "../repositories/blogs-query-repository";
import {PostsRepository} from "../repositories/posts-repository";
import {PostsQueryRepository} from "../repositories/posts-query-repository";

export class PostsService {
    static async createPost(inputData: PostInputModel): Promise<PostViewModel | null> {
        const {title, shortDescription, content, blogId} = inputData
        const blog = await BlogsQueryRepository.getBlogById(blogId)
        if (!blog) return null
        const newPost: PostDBModel = {
            title, shortDescription, content, blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        }
        const createdPostId = await PostsRepository.createPost(newPost)
        if (!createdPostId) {
            return null
        }
        const post = await PostsQueryRepository.getPostById(createdPostId)
        if (!post) {
            return null
        }
        return post
    }
    static async updatePost(id: string, inputData: PostInputModel): Promise<boolean | null> {
        const {title, shortDescription, content, blogId} = inputData
        const post = await PostsQueryRepository.getPostById(id)
        if (!post) {
            return null
        }
        const newPost = {
            ...post,
            title, shortDescription, content, blogId
        }
        return await PostsRepository.updatePost(id, newPost)
    }
    static async deletePost(id: string): Promise<boolean> {
        return await PostsRepository.deletePost(id)
    }
}