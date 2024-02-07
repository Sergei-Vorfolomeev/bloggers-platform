import {BlogDBModel, BlogViewModel} from "../db/db.types";
import {WithId} from "mongodb";

export const blogMapper = (blog: WithId<BlogDBModel>): BlogViewModel => {
    return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
    }
}