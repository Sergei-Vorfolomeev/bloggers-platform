import {MongoClient} from "mongodb";
import {
    BlogDBModel,
    CommentDBModel,
    ConnectionDBModel,
    DeviceDBModel, LikeEntityDBModel,
    PostDBModel,
    UserDBModel
} from "../repositories/types";
import {settings} from "../settings";
import * as mongoose from "mongoose";

export const client = new MongoClient(settings.MONGO_URI)

export const dataBase = client.db('bloggers-platform')
export const blogsCollection = dataBase.collection<BlogDBModel>('blogs')
export const postsCollection = dataBase.collection<PostDBModel>('posts')
export const usersCollection = dataBase.collection<UserDBModel>('users')
export const commentsCollection = dataBase.collection<CommentDBModel>('comments')
export const devicesCollection = dataBase.collection<DeviceDBModel>('devices')
export const connectionsCollection = dataBase.collection<ConnectionDBModel>('connections')
export const likesCollection = dataBase.collection<LikeEntityDBModel>('likes')


export const runDB = async () => {
    try {
        await mongoose.connect(settings.MONGO_URI, {dbName: 'bloggers-platform'})
        console.log('You successfully connected to MongoDB!')
    } catch (e) {
        console.log(e)
        await mongoose.disconnect()
    }
}


