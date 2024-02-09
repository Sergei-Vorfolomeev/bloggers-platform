import {postsCollection} from "../db/db";
import {postMapper} from "../utils/post-mapper";
import {ObjectId} from "mongodb";
import {PostsSortParams} from "./types";
import {Paginator} from "../routers/types";
import {PostViewModel} from "../services/types";
import {BlogsQueryRepository} from "./blogs-query-repository";

export class PostsQueryRepository {
    static async getPostsWithFilter(filter: {}, sortParams: PostsSortParams) {
        const {sortBy, sortDirection, pageSize, pageNumber} = sortParams
        const posts = await postsCollection
            .find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort(sortBy, sortDirection)
            .toArray()
        const totalCount = await postsCollection.countDocuments(filter)
        const pagesCount = Math.ceil(totalCount / pageSize) === 0 ? 1 : Math.ceil(totalCount / pageSize)
        return {
            items: posts.map(postMapper),
            page: pageNumber,
            pageSize,
            pagesCount,
            totalCount
        }
    }

    static async getPosts(sortParams: PostsSortParams): Promise<Paginator<PostViewModel[]> | null> {
        try {
            let filter = {}
            return await this.getPostsWithFilter(filter, sortParams)
        } catch (e) {
            console.log(e)
            return null
        }
    }

    static async getPostById(id: string): Promise<PostViewModel | null> {
        try {
            const post = await postsCollection.findOne({_id: new ObjectId(id)})
            if (!post) return null
            return postMapper(post)
        } catch (e) {
            console.log(e)
            return null
        }
    }

    static async getPostsByBlogId(id: string, sortParams: PostsSortParams): Promise<Paginator<PostViewModel[]> | null> {
        try {
            const blog = await BlogsQueryRepository.getBlogById(id)
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