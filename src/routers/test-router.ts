import {Request, Response, Router} from "express";
import {BlogModel} from "../db/mongoose/models/blog.model";
import {PostModel} from "../db/mongoose/models/post.model";
import {UserModel} from "../db/mongoose/models/user.model";
import {CommentModel} from "../db/mongoose/models/comment.model";
import {DeviceModel} from "../db/mongoose/models/device.model";

export const testRouter = Router()

testRouter.delete('/', async (req: Request, res: Response) => {
    await BlogModel.deleteMany({})
    await PostModel.deleteMany({})
    await UserModel.deleteMany({})
    await CommentModel.deleteMany({})
    await DeviceModel.deleteMany({})
    res.sendStatus(204)
})