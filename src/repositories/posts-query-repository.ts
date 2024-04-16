import {ObjectId, WithId} from "mongodb";
import {PostDBModel, SortParams} from "./types";
import {Paginator} from "../routers/types";
import {LikeStatus, PostViewModel} from "../services/types";
import {BlogsQueryRepository} from "./blogs-query-repository";
import {PostModel} from "../db/mongoose/models/post.model";
import {LikesQueryRepository} from "./likes-query-repository";

export class PostsQueryRepository {
    constructor(
        protected blogsQueryRepository: BlogsQueryRepository,
        protected likesQueryRepository: LikesQueryRepository,
    ) {
    }

    async getPostsWithFilter(filter: {}, sortParams: SortParams, userId: string | null): Promise<Paginator<PostViewModel[]> | null> {
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
                items: await this.mapToView(posts, userId),
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

    async getPosts(sortParams: SortParams, userId: string | null): Promise<Paginator<PostViewModel[]> | null> {
        try {
            let filter = {}
            return await this.getPostsWithFilter(filter, sortParams, userId)
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async getPostById(postId: string, userId: string | null): Promise<PostViewModel | null> {
        try {
            const post = await PostModel.findById(new ObjectId(postId))
            if (!post) {
                return null
            }
            const res = await this.mapToView([post], userId)
            return res[0]
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async getPostsByBlogId(blogId: string, sortParams: SortParams, userId: string | null): Promise<Paginator<PostViewModel[]> | null> {
        try {
            const blog = await this.blogsQueryRepository.getBlogById(blogId)
            if (!blog) {
                return null
            }
            let filter = {
                blogId: {
                    $eq: blog.id,
                }
            }
            return await this.getPostsWithFilter(filter, sortParams, userId)
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async mapToView(posts: WithId<PostDBModel>[], userId: string | null): Promise<PostViewModel[]> {
        return await Promise.all(posts.map(async post => {
            let likeStatus: LikeStatus | null = null
            if (userId) {
                likeStatus = await this.likesQueryRepository.getPostLikeStatus(post._id.toString(), userId)
            }
            const newestLikes = await this.likesQueryRepository.getNewestLikes(post._id.toString())
            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.likesInfo.likesCount,
                    dislikesCount: post.likesInfo.dislikesCount,
                    myStatus: likeStatus ?? 'None',
                    newestLikes: newestLikes ?? []
                }
            }
        }))
    }
}