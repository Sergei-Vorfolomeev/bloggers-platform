import {Router} from "express";
import {
    APIErrorResult,
    LoginInputModel,
    LoginSuccessViewModel,
    RegistrationConfirmationCodeModel,
    RegistrationEmailResendingModel,
    RequestType,
    RequestWithBody,
    ResponseType,
    ResponseWithBody,
    UserInputModel,
    UserOutputModel
} from "./types";
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
    async (req: RequestWithBody<LoginInputModel>, res: ResponseWithBody<LoginSuccessViewModel>) => {
        const {loginOrEmail, password} = req.body
        const {statusCode, data} = await AuthService.login(loginOrEmail, password)
        switch (statusCode) {
            case StatusCode.Unauthorized:
                res.sendStatus(401)
                break
            case StatusCode.ServerError:
                res.sendStatus(555)
                break
            case StatusCode.Success:
                res.cookie('refreshToken', data!.refreshToken, {httpOnly: true, secure: true})
                res.status(200).send({accessToken: data!.accessToken})
                break
        }
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
        const {statusCode} = await AuthService.registerUser(login, email, password)
        switch (statusCode) {
            case StatusCode.ServerError:
                res.sendStatus(555);
                break
            case StatusCode.NoContent:
                res.sendStatus(204);
                break
        }
    })

authRouter.post('/registration-confirmation',
    async (req: RequestWithBody<RegistrationConfirmationCodeModel>, res: ResponseWithBody<APIErrorResult | string | null>) => {
        const {code} = req.body
        const {statusCode, errorsMessages} = await AuthService.confirmEmailByCode(code)
        switch (statusCode) {
            case StatusCode.BadRequest:
                res.status(400).send(errorsMessages);
                break
            case StatusCode.ServerError:
                res.status(555).send(errorsMessages);
                break
            case StatusCode.NoContent:
                res.sendStatus(204);
                break
        }
    })

authRouter.post('/registration-email-resending', emailValidator(),
    async (req: RequestWithBody<RegistrationEmailResendingModel>, res: ResponseWithBody<APIErrorResult | string | null>) => {
        const {email} = req.body
        const {statusCode, errorsMessages} = await AuthService.resendConfirmationCode(email)
        switch (statusCode) {
            case StatusCode.BadRequest:
                res.status(400).send(errorsMessages);
                break
            case StatusCode.ServerError:
                res.status(555).send(errorsMessages);
                break
            case StatusCode.NoContent:
                res.sendStatus(204);
                break
        }
    })

authRouter.post('/refresh-token', async (req: RequestType, res: ResponseWithBody<LoginSuccessViewModel>) => {
    const refreshToken = req.cookies.refreshToken
    const {statusCode, data} = await AuthService.updateTokens(refreshToken)
    switch (statusCode) {
        case StatusCode.Unauthorized:
            res.sendStatus(401)
            break
        case StatusCode.ServerError:
            res.sendStatus(555)
            break
        case StatusCode.Success:
            res.cookie('refreshToken', data!.refreshToken, {httpOnly: true, secure: true})
            res.status(200).send({accessToken: data!.accessToken})
            break
    }
})

authRouter.post('/logout', async (req: RequestType, res: ResponseType) => {
    const refreshToken = req.cookies.refreshToken
    const {statusCode} = await AuthService.logout(refreshToken)
    switch (statusCode) {
        case StatusCode.Unauthorized:
            res.sendStatus(401)
            break
        case StatusCode.ServerError:
            res.sendStatus(555)
            break
        case StatusCode.NoContent:
            res.sendStatus(204)
            break
    }
})