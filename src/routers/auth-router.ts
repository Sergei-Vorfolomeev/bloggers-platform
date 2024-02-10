import {Router} from "express";
import {LoginInputModel, RequestWithBody, ResponseType} from "./types";
import {UsersService} from "../services/users-service";

export const authRouter = Router()

authRouter.post('/login', async (req: RequestWithBody<LoginInputModel>, res: ResponseType) => {
    const {loginOrEmail, password} = req.body
    await UsersService.createUser(loginOrEmail, password)
})