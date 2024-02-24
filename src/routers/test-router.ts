import {Request, Response, Router} from "express";
import {blogsCollection, commentsCollection, devicesCollection, postsCollection, usersCollection} from "../db/db";

export const testRouter = Router()

testRouter.delete('/', async (req: Request, res: Response) => {
    await blogsCollection.deleteMany({})
    await postsCollection.deleteMany({})
    await usersCollection.deleteMany({})
    await commentsCollection.deleteMany({})
    await devicesCollection.deleteMany({})
    res.sendStatus(204)
})