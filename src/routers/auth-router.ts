import {Router} from "express";
import {
    APIErrorResult,
    LoginInputModel,
    LoginSuccessViewModel, NewPasswordRecoveryInputModel,
    PasswordRecoveryInputModel,
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
import {userValidators} from "../validators/user-validators";
import {AuthService} from "../services/auth-service";
import {StatusCode} from "../utils/result";
import {emailValidator} from "../validators/email-validator";
import {rateLimiter} from "../middlewares/rate-limiter-middleware";
import {newPasswordValidators} from "../validators/new-password-validator";
import {authController} from "../composition-root";

export const authRouter = Router()

export class AuthController {
    constructor(private authService: AuthService) {
    }

    async login(req: RequestWithBody<LoginInputModel>, res: ResponseWithBody<LoginSuccessViewModel>) {
        const {loginOrEmail, password} = req.body
        const deviceName = req.headers['user-agent'] || 'unknown'
        const clientIp = req.ip || 'unknown'
        const {statusCode, data} = await this.authService.login(loginOrEmail, password, deviceName.toString(), clientIp)
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
    }

    async me(req: RequestType, res: ResponseWithBody<UserOutputModel>) {
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
    }

    async registration(req: RequestWithBody<UserInputModel>, res: ResponseType) {
        const {login, email, password} = req.body
        const {statusCode} = await this.authService.registerUser(login, email, password)
        switch (statusCode) {
            case StatusCode.ServerError:
                res.sendStatus(555);
                break
            case StatusCode.NoContent:
                res.sendStatus(204);
                break
        }
    }

    async registrationConfirmation(req: RequestWithBody<RegistrationConfirmationCodeModel>, res: ResponseWithBody<APIErrorResult | string | null>) {
        const {code} = req.body
        const {statusCode, errorsMessages} = await this.authService.confirmEmailByCode(code)
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
    }

    async registrationEmailResending(req: RequestWithBody<RegistrationEmailResendingModel>, res: ResponseWithBody<APIErrorResult | string | null>) {
        const {email} = req.body
        const {statusCode, errorsMessages} = await this.authService.resendConfirmationCode(email)
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
    }

    async refreshToken(req: RequestType, res: ResponseWithBody<LoginSuccessViewModel>) {
        const refreshToken = req.cookies.refreshToken
        const {statusCode, data} = await this.authService.updateTokens(refreshToken)
        switch (statusCode) {
            case StatusCode.NotFound:
                res.sendStatus(404)
                break
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
    }

    async logout(req: RequestType, res: ResponseType) {
        const refreshToken = req.cookies.refreshToken
        const {statusCode} = await this.authService.logout(refreshToken)
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
    }

    async passwordRecovery(req: RequestWithBody<PasswordRecoveryInputModel>, res: ResponseType) {
        const {email} = req.body
        const {statusCode} = await this.authService.recoverPassword(email)
        switch (statusCode) {
            case StatusCode.ServerError:
                res.sendStatus(555)
                break
            case StatusCode.NoContent:
                res.sendStatus(204)
                break
        }
    }

    async newPassword(req: RequestWithBody<NewPasswordRecoveryInputModel>, res: ResponseType) {
        const {recoveryCode, newPassword} = req.body
        const {statusCode} = await this.authService.updatePassword(recoveryCode, newPassword)
        switch (statusCode) {
            case StatusCode.BadRequest:
                res.sendStatus(400)
                break
            case StatusCode.ServerError:
                res.sendStatus(555)
                break
            case StatusCode.NoContent:
                res.sendStatus(204)
                break
        }
    }
}


authRouter.post('/login', rateLimiter, validateLoginOrEmail(), authController.login.bind(authController))
authRouter.get('/me', accessTokenGuard, authController.me.bind(authController))
authRouter.post('/registration', rateLimiter, userValidators(), authController.registration.bind(authController))
authRouter.post('/registration-confirmation', rateLimiter, authController.registrationConfirmation.bind(authController))
authRouter.post('/registration-email-resending', rateLimiter, emailValidator(), authController.registrationEmailResending.bind(authController))
authRouter.post('/refresh-token', authController.refreshToken.bind(authController))
authRouter.post('/logout', authController.logout.bind(authController))
authRouter.post('/password-recovery', rateLimiter, emailValidator(), authController.passwordRecovery.bind(authController))
authRouter.post('/new-password', rateLimiter, newPasswordValidators(), authController.newPassword.bind(authController))