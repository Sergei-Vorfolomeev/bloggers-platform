import {Router} from "express";
import {LoginInputModel, RequestType, RequestWithBody, ResponseWithBody, UserOutputModel} from "./types";
import {UsersService} from "../services/users-service";
import {validateLoginOrEmail} from "../validators/login-or-email-validator";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {UsersQueryRepository} from "../repositories/users-query-repository";

export const authRouter = Router()

authRouter.post(
    '/login',
    validateLoginOrEmail(),
    async (req: RequestWithBody<LoginInputModel>, res: ResponseWithBody<{ accessToken: string }>) => {
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

authRouter.get('/me', accessTokenGuard,
    async (req: RequestType, res: ResponseWithBody<UserOutputModel>) => {
        const {id: userId} = req.user
        const user = await UsersQueryRepository.getUserById(userId)
        if (!user) {
            res.sendStatus(401)
            return
        }
        res.status(200).send({
            userId: user.id,
            login: user.login,
            email: user.email,
        })
    })