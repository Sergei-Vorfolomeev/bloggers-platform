import {WithId} from "mongodb";
import {PostDBModel} from "../repositories/types";
import {PostViewModel} from "../services/types";

export const postMapper = (post: WithId<PostDBModel>): PostViewModel => {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
    }
}