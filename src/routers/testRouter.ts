import {Request, Response, Router} from "express";
import {db} from "../db/db";

export const testRouter = Router()

testRouter.delete('/', (req: Request, res: Response) => {
    db.blogs = []
    db.posts = []
    res.sendStatus(204)
})