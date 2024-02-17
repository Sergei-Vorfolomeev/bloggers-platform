import {client, commentsCollection, postsCollection} from "../db/db";
import {ObjectId} from "mongodb";
import {PostDBModel} from "./types";
import {PostInputModel} from "../routers/types";

export class PostsRepository {
    static async createPost(post: PostDBModel): Promise<string | null> {
        try {
            const res = await postsCollection.insertOne(post)
            return res.insertedId.toString()
        } catch (e) {
            console.log(e)
            return null
        }
    }

    static async updatePost(id: string, post: PostInputModel): Promise<boolean> {
        try {
            const res = await postsCollection.updateOne({_id: new ObjectId(id)}, {
                $set: post
            })
            return !!res.matchedCount
        } catch (e) {
            console.log(e)
            return false
        }
    }

    static async deletePost(id: string): Promise<boolean> {
        const session = await client.startSession()
        await session.startTransaction()
        try {
           const res =  await postsCollection.deleteOne({_id: new ObjectId(id)})
            await commentsCollection.deleteMany({postId: id})
            await session.commitTransaction()
            return res.deletedCount === 1
        } catch (e) {
            console.log(e)
            return false
        } finally {
            await session.endSession()
        }
    }
}