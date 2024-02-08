import {BlogViewModel, Paginator} from "../db/db.types";
import {blogsCollection} from "../db/db";
import {blogMapper} from "../utils/blog-mapper";
import {ObjectId, SortDirection} from "mongodb";

type SortParams = {
    searchNameTerm: string | null
    sortBy: string
    sortDirection: SortDirection
    pageNumber: number
    pageSize: number
}

export class BlogsQueryRepository {
    static async getBlogs(sortParams: SortParams): Promise<Paginator<BlogViewModel[]> | null> {
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
            const pagesCount = totalCount / pageSize
            return {
                items: blogs.map(blogMapper),
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

    static async getBlogById(id: string): Promise<BlogViewModel | null> {
        try {
            const blog = await blogsCollection.findOne({_id: new ObjectId(id)})
            if (!blog) return null
            return blogMapper(blog)
        } catch (e) {
            console.log(e)
            return null
        }
    }
}