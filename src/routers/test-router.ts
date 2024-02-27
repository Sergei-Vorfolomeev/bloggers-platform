import {Request, Response, Router} from "express";
import {commentsCollection, devicesCollection, usersCollection} from "../db/db";
import {BlogModel} from "../repositories/models/blog.model";
import {PostModel} from "../repositories/models/post.model";

export const testRouter = Router()

testRouter.delete('/', async (req: Request, res: Response) => {
    await BlogModel.deleteMany({})
    await PostModel.deleteMany({})
    await usersCollection.deleteMany({})
    await commentsCollection.deleteMany({})
    await devicesCollection.deleteMany({})
    res.sendStatus(204)
})