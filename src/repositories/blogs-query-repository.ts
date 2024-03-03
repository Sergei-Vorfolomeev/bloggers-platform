import {blogMapper} from "../utils/blog-mapper";
import {ObjectId} from "mongodb";
import {BlogsSortParams} from "./types";
import {BlogViewModel} from "../services/types";
import {Paginator} from "../routers/types";
import {BlogModel} from "../db/mongoose/models/blog.model";
import {injectable} from "inversify";

@injectable()
export class BlogsQueryRepository {
    async getBlogs(sortParams: BlogsSortParams): Promise<Paginator<BlogViewModel[]> | null> {
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
            const blogs = await BlogModel
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort({[sortBy]: sortDirection})
                .lean()
                .exec()
            const totalCount = await BlogModel.countDocuments(filter)
            const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
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

    async getBlogById(id: string): Promise<BlogViewModel | null> {
        try {
            const blog = await BlogModel.findById(new ObjectId(id)).lean().exec()
            if (!blog) {
                return null
            }
            return blogMapper(blog)
        } catch (e) {
            console.error(e)
            return null
        }
    }
}