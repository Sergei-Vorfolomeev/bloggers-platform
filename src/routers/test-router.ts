import {Request, Response, Router} from "express";
import {blogsCollection, db, postsCollection} from "../db/db";

export const testRouter = Router()

testRouter.delete('/', async (req: Request, res: Response) => {
   await blogsCollection.deleteMany({})
   await postsCollection.deleteMany({})
    res.sendStatus(204)
})