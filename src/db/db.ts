import {MongoClient} from "mongodb";
import dotenv from 'dotenv'
import {BlogDBModel, PostDBModel} from "../repositories/types";

dotenv.config()

const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017'
const client = new MongoClient(mongoURI)

const dataBase = client.db('bloggers-platform')
export const blogsCollection = dataBase.collection<BlogDBModel>('blogs')
export const postsCollection = dataBase.collection<PostDBModel>('posts')

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


