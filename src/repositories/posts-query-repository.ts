import {postsCollection} from "../db/db";
import {postMapper} from "../utils/post-mapper";
import {ObjectId} from "mongodb";
import {PostsSortParams} from "./types";
import {Paginator} from "../routers/types";
import {PostViewModel} from "../services/types";

export class PostsQueryRepository {
    static async getPosts(sortParams: PostsSortParams): Promise<Paginator<PostViewModel[]> | null> {
        try {
            let filter = {}
            const {sortBy, sortDirection, pageSize, pageNumber} = sortParams
            const posts = await postsCollection
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort(sortBy, sortDirection)
                .toArray()
            const totalCount = await postsCollection.countDocuments(filter)
            const pagesCount = totalCount / pageSize
            return {
                items: posts.map(postMapper),
                page: pageNumber,
                pageSize,
                pagesCount,
                totalCount
            }
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

}