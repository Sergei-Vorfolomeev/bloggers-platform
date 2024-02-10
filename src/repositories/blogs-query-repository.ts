import {blogsCollection} from "../db/db";
import {blogMapper} from "../utils/blog-mapper";
import {ObjectId} from "mongodb";
import {BlogsSortParams} from "./types";
import {BlogViewModel} from "../services/types";
import {Paginator} from "../routers/types";

export class BlogsQueryRepository {
    static async getBlogs(sortParams: BlogsSortParams): Promise<Paginator<BlogViewModel[]> | null> {
        try {
            const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = sortParams
            let filter = {}
            if (searchNameTerm) {
                filter = {
                    name: {
                        $regex: searchNameTerm,
                        $options: 'i'
                    }
                }
            }
            const blogs = await blogsCollection
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort(sortBy, sortDirection)
                .toArray()
            const totalCount = await blogsCollection.countDocuments(filter)
            const pagesCount = Math.ceil(totalCount / pageSize) === 0 ? 1 : Math.ceil(totalCount / pageSize)
            return {
                items: blogs.map(blogMapper),
                page: pageNumber,
                pageSize,
                pagesCount,
                totalCount
            }
        } catch (e) {
            return null
        }
    }

    static async getBlogById(id: string): Promise<BlogViewModel | null> {
        try {
            const blog = await blogsCollection.findOne({_id: new ObjectId(id)})
            if (!blog) return null
            return blogMapper(blog)
        } catch (e) {
            console.error(e)
            return null
        }
    }
}