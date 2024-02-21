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
        const result = await AuthService.login(loginOrEmail, password)
        switch (result.statusCode) {
            case StatusCode.UNAUTHORIZED:
                res.sendStatus(401)
                break
            case StatusCode.SERVER_ERROR:
                res.sendStatus(555)
                break
            case StatusCode.SUCCESS:
                res.cookie('token', result.data!.refreshToken, {httpOnly: true, secure: true})
                res.status(200).send({accessToken: result.data!.accessToken})
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
    async (req: RequestWithBody<RegistrationConfirmationCodeModel>, res: ResponseWithBody<APIErrorResult | string | null>) => {
        const {code} = req.body
        const response = await AuthService.confirmEmailByCode(code)
        switch (response.statusCode) {
            case StatusCode.NO_CONTENT:
                res.sendStatus(204);
                break
            case StatusCode.BAD_REQUEST:
                res.status(400).send(response.errorsMessages);
                break
            case StatusCode.SERVER_ERROR:
                res.status(555).send(response.errorsMessages);
                break
        }
    })

authRouter.post('/registration-email-resending', emailValidator(),
    async (req: RequestWithBody<RegistrationEmailResendingModel>, res: ResponseWithBody<APIErrorResult | string | null>) => {
        const {email} = req.body
        const response = await AuthService.resendConfirmationCode(email)
        switch (response.statusCode) {
            case StatusCode.BAD_REQUEST:
                res.status(400).send(response.errorsMessages);
                break
            case StatusCode.SERVER_ERROR:
                res.status(555).send(response.errorsMessages);
                break
            case StatusCode.NO_CONTENT:
                res.sendStatus(204);
                break
        }
    })

authRouter.post('/refresh-token', async (req: RequestType, res: ResponseWithBody<LoginSuccessViewModel>) => {
    const refreshToken = req.cookies.token
    const result = await AuthService.updateTokens(refreshToken)
    switch (result.statusCode) {
        case StatusCode.UNAUTHORIZED:
            res.sendStatus(401)
            break
        case StatusCode.SERVER_ERROR:
            res.sendStatus(555)
            break
        case StatusCode.SUCCESS:
            res.cookie('token', result.data!.refreshToken, {httpOnly: true, secure: true})
            res.status(200).send({accessToken: result.data!.accessToken})
            break
    }
})

authRouter.post('/logout', async (req: RequestType, res: ResponseType) => {
    const refreshToken = req.cookies.token
    const result = await AuthService.logout(refreshToken)
    switch (result.statusCode) {
        case StatusCode.UNAUTHORIZED:
            res.sendStatus(401)
            break
        case StatusCode.SERVER_ERROR:
            res.sendStatus(555)
            break
        case StatusCode.SUCCESS:
            res.sendStatus(204)
            break
    }
})