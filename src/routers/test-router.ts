import {Request, Response, Router} from "express";
import {BlogModel} from "../repositories/models/blog.model";
import {PostModel} from "../repositories/models/post.model";
import {UserModel} from "../repositories/models/user.model";
import {CommentModel} from "../repositories/models/comment.model";
import {DeviceModel} from "../repositories/models/device.model";

export const testRouter = Router()

testRouter.delete('/', async (req: Request, res: Response) => {
    await BlogModel.deleteMany({})
    await PostModel.deleteMany({})
    await UserModel.deleteMany({})
    await CommentModel.deleteMany({})
    await DeviceModel.deleteMany({})
    res.sendStatus(204)
})