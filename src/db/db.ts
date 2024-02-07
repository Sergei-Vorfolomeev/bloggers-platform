import {BlogDBModel, BlogViewModel, DBType, PostDBModel, PostViewModel} from "./db.types";
import {MongoClient} from "mongodb";
import dotenv from 'dotenv'

dotenv.config()

export const db: DBType = {
    blogs: [
        {
            id: "1",
            name: "Blog Name",
            description: "Blog Description",
            websiteUrl: "https://web-site.com"
        }
    ],
    posts: [
        {
            id: "1",
            title: "Post Title",
            shortDescription: "Post Short Description",
            content: "Post Content",
            blogId: "1",
            blogName: "Blog Name"
        }
    ]
}

const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017'
const client = new MongoClient(mongoURI)

const dataBase = client.db('bloggers-platform')
export const blogsCollection = dataBase.collection<BlogDBModel>('blogs')
export const postsCollection = dataBase.collection<PostDBModel>('posts')

export const runDB = async () => {
    try {
        await client.connect()
        await client.db('blogs').command({ping: 1})
        console.log('Successfully connected to MongoDB')
    } catch (e) {
        console.log(e)
        await client.close()
    }
}


