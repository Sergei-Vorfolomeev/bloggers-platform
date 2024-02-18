import {Router} from "express";
import {
    LoginInputModel, RegistrationConfirmationCodeModel, RegistrationEmailResendingModel,
    RequestType,
    RequestWithBody,
    ResponseType,
    ResponseWithBody,
    UserInputModel,
    UserOutputModel
} from "./types";
import {UsersService} from "../services/users-service";
import {validateLoginOrEmail} from "../validators/login-or-email-validator";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {userValidator} from "../validators/user-validator";
import {AuthService} from "../services/auth-service";
import {StatusCode} from "../utils/result";
import {emailValidator} from "../validators/email-validator";

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

authRouter.post('/registration', userValidator(),
    async (req: RequestWithBody<UserInputModel>, res: ResponseType) => {
        const {login, email, password} = req.body
        const response = await AuthService.registerUser(login, email, password)
        switch (response.statusCode) {
            case StatusCode.NO_CONTENT:
                res.sendStatus(204);
                break
            case StatusCode.SERVER_ERROR:
                res.sendStatus(555);
                break
        }
    })

authRouter.post('/registration-confirmation',
    async (req: RequestWithBody<RegistrationConfirmationCodeModel>, res: ResponseType) => {
        const {code} = req.body
        const response = await AuthService.confirmEmailByCode(code)
        switch (response.statusCode) {
            case StatusCode.NO_CONTENT:
                res.sendStatus(204);
                break
            case StatusCode.BAD_REQUEST:
                res.sendStatus(400);
                break
            case StatusCode.SERVER_ERROR:
                res.sendStatus(555);
                break
        }
    })

authRouter.post('/registration-email-resending', emailValidator(),
    async (req: RequestWithBody<RegistrationEmailResendingModel>, res: ResponseType) => {
        const {email} = req.body
        const response = await AuthService.resendConfirmationCode(email)
        switch (response.statusCode) {
            case StatusCode.NO_CONTENT:
                res.sendStatus(204);
                break
            case StatusCode.BAD_REQUEST:
                res.sendStatus(400);
                break
            case StatusCode.SERVER_ERROR:
                res.sendStatus(555);
                break
        }
    })