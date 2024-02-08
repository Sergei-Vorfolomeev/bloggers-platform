import {WithId} from "mongodb";
import {BlogDBModel} from "../repositories/types";
import {BlogViewModel} from "../services/types";

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