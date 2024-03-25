import {Router} from "express";
import {validateLoginOrEmail} from "../validators/login-or-email-validator";
import {accessTokenGuard} from "../middlewares/access-token-guard";
import {userValidators} from "../validators/user-validators";
import {emailValidator} from "../validators/email-validator";
import {rateLimiter} from "../middlewares/rate-limiter-middleware";
import {newPasswordValidators} from "../validators/new-password-validator";
import {container} from "../composition-root";
import {AuthController} from "../controllers";

export const authRouter = Router()

const authController = container.resolve(AuthController)

authRouter.post('/login', rateLimiter, validateLoginOrEmail(), authController.login.bind(authController))
authRouter.get('/me', accessTokenGuard, authController.me.bind(authController))
authRouter.post('/registration', rateLimiter, userValidators(), authController.registration.bind(authController))
authRouter.post('/registration-confirmation', rateLimiter, authController.registrationConfirmation.bind(authController))
authRouter.post('/registration-email-resending', rateLimiter, emailValidator(), authController.registrationEmailResending.bind(authController))
authRouter.post('/refresh-token', authController.refreshToken.bind(authController))
authRouter.post('/logout', authController.logout.bind(authController))
authRouter.post('/password-recovery', rateLimiter, emailValidator(), authController.passwordRecovery.bind(authController))
authRouter.post('/new-password', rateLimiter, newPasswordValidators(), authController.newPassword.bind(authController))