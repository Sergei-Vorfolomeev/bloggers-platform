import {postMapper} from "../utils/post-mapper";
import {ObjectId} from "mongodb";
import {SortParams} from "./types";
import {Paginator} from "../routers/types";
import {PostViewModel} from "../services/types";
import {BlogsQueryRepository} from "./blogs-query-repository";
import {PostModel} from "../db/mongoose/models/post.model";
import {inject, injectable} from "inversify";

@injectable()
export class PostsQueryRepository {
    constructor(@inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository) {
    }

    async getPostsWithFilter(filter: {}, sortParams: SortParams): Promise<Paginator<PostViewModel[]> | null> {
        try {
            const {sortBy, sortDirection, pageSize, pageNumber} = sortParams
            const posts = await PostModel
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort({[sortBy]: sortDirection})
                .lean()
                .exec()
            const totalCount = await PostModel.countDocuments(filter)
            const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
            return {
                items: posts.map(postMapper),
                page: pageNumber,
                pageSize,
                pagesCount,
                totalCount
            }
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async getPosts(sortParams: SortParams): Promise<Paginator<PostViewModel[]> | null> {
        try {
            let filter = {}
            return await this.getPostsWithFilter(filter, sortParams)
        } catch (e) {
            console.log(e)
            return null
        }
    }

    async getPostById(id: string): Promise<PostViewModel | null> {
        try {
            const post = await PostModel.findById(new ObjectId(id))
            if (!post) {
                return null
            }
            return postMapper(post)
        } catch (e) {
            console.log(e)
            return null
        }
    }

    async getPostsByBlogId(id: string, sortParams: SortParams): Promise<Paginator<PostViewModel[]> | null> {
        try {
            const blog = await this.blogsQueryRepository.getBlogById(id)
            if (!blog) {
                return null
            }
            let filter = {
                blogId: {
                    $eq: blog.id,
                }
            }
            return await this.getPostsWithFilter(filter, sortParams)
        } catch (e) {
            console.error(e)
            return null
        }
    }
}