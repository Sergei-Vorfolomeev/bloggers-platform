import {Router} from "express";
import {LoginInputModel, RequestWithBody, ResponseType} from "./types";
import {UsersService} from "../services/users-service";
import {validateLoginOrEmail} from "../validators/login-or-email-validator";

export const authRouter = Router()

authRouter.post(
    '/login',
    validateLoginOrEmail(),
    async (req: RequestWithBody<LoginInputModel>, res: ResponseType) => {
        const {loginOrEmail, password} = req.body
        const hasAccess = await UsersService.checkUserCredentials(loginOrEmail, password)
        hasAccess
            ? res.sendStatus(204)
            : res.sendStatus(401)
    })