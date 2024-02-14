import {MongoClient} from "mongodb";
import {BlogDBModel, CommentDBModel, PostDBModel, UserDBModel} from "../repositories/types";
import {settings} from "../settings";

const client = new MongoClient(settings.MONGO_URI)

const dataBase = client.db('bloggers-platform')
export const blogsCollection = dataBase.collection<BlogDBModel>('blogs')
export const postsCollection = dataBase.collection<PostDBModel>('posts')
export const usersCollection = dataBase.collection<UserDBModel>('users')
export const commentsCollection = dataBase.collection<CommentDBModel>('comments')

export const runDB = async () => {
    try {
        await client.connect()
        await client.db("admin").command({ping: 1})
        console.log('You successfully connected to MongoDB!')
    } catch (e) {
        console.log(e)
        await client.close()
    }
}


