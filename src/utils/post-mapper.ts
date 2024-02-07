import {PostDBModel, PostViewModel} from "../db/db.types";
import {WithId} from "mongodb";

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