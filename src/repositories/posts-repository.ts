import {PostDBModel, PostInputModel, PostViewModel} from "../db/db.types";
import {blogsCollection, postsCollection} from "../db/db";
import {postMapper} from "../utils/post-mapper";
import {ObjectId} from "mongodb";

export class postsRepository {
    static async getPosts(): Promise<PostViewModel[]> {
        const posts = await postsCollection.find({}).toArray()
        return posts.map(postMapper)
    }
    static async getPostById(id: string): Promise<PostViewModel | null> {
        const post = await postsCollection.findOne({_id: new ObjectId(id)})
        if (!post) return null
        return postMapper(post)
    }
    static async createPost(body: PostInputModel): Promise<PostViewModel | null> {
        const {title, shortDescription, content, blogId} = body
        const blog = await blogsCollection.findOne({_id: new ObjectId(blogId)})
        if (!blog) return null
        const { name: blogName } = blog
        const newPost: PostDBModel = {
            title, shortDescription, content, blogId, blogName,
            createdAt: new Date().toISOString(),
        }
        const res = await postsCollection.insertOne(newPost)
        const post = await this.getPostById(res.insertedId.toString())
        if (!post) return null
        return post
    }
    static async updatePost(id: string, body: PostInputModel): Promise<boolean> {
        const {title, shortDescription, content, blogId} = body
        const res = await postsCollection.updateOne({_id: new ObjectId(id)}, {
            $set: {title, shortDescription, content, blogId}
        })
        return !!res.matchedCount
    }
    static async deletePost(id: string): Promise<boolean> {
        const res = await postsCollection.deleteOne({_id:  new ObjectId(id)})
        return !!res.deletedCount
    }
}