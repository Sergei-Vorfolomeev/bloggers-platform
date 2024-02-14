import {Router} from "express";
import {LoginInputModel, RequestWithBody, ResponseWithBody} from "./types";
import {UsersService} from "../services/users-service";
import {validateLoginOrEmail} from "../validators/login-or-email-validator";

export const authRouter = Router()

authRouter.post(
    '/login',
    validateLoginOrEmail(),
    async (req: RequestWithBody<LoginInputModel>, res: ResponseWithBody<{accessToken: string}>) => {
        const {loginOrEmail, password} = req.body
        const token = await UsersService.checkUserCredentials(loginOrEmail, password)
        if (!token) {
            res.sendStatus(401)
            return
        }
        const response = {
            accessToken: token
        }
        res.status(200).send(response)
    })