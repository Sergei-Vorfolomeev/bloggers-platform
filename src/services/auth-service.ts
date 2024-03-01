import {BcryptService} from "./bcrypt-service";
import {DeviceDBModel, UserDBModel} from "../repositories/types";
import {randomUUID} from "crypto";
import {add} from "date-fns/add";
import {Result, StatusCode} from "../utils/result";
import {NodemailerService} from "./nodemailer-service";
import {templateForRegistration} from "../templates/template-for-registration";
import {ErrorsMessages, FieldError} from "../utils/errors-messages";
import {TokensPayload} from "./types";
import {JwtService} from "./jwt-service";
import {ObjectId, WithId} from "mongodb";
import {CryptoService} from "./crypto-service";
import {DevicesRepository} from "../repositories/devices-repository";
import {templateForPasswordRecovery} from "../templates/template-for-password-recovery";
import {UsersRepository} from "../repositories/users-repository";

export class AuthService {
    constructor(private usersRepository: UsersRepository, private jwtService: JwtService) {}

    async registerUser(login: string, email: string, password: string): Promise<Result> {
        const hashedPassword = await BcryptService.generateHash(password)
        if (!hashedPassword) {
            return new Result(StatusCode.ServerError, 'Error with hashing password')
        }
        const newUser: UserDBModel = {
            login,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }),
                isConfirmed: false
            },
        }
        const userId = await this.usersRepository.createUser(newUser)
        if (!userId) {
            return new Result(StatusCode.ServerError, 'Error with creating user in db')
        }
        const info = await NodemailerService.sendEmail(email, 'Confirm your email', templateForRegistration(newUser.emailConfirmation.confirmationCode))
        if (!info) {
            return new Result(StatusCode.ServerError, 'Error with sending email')
        }
        return new Result(StatusCode.NoContent)
    }

    async confirmEmailByCode(code: string): Promise<Result> {
        const user = await this.usersRepository.findByConfirmationCode(code)
        if (!user) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is incorrect'))
            )
        }
        if (user.emailConfirmation.isConfirmed) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is already been applied'))
            )
        }
        if (new Date() > user.emailConfirmation.expirationDate) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('code', 'Confirmation code is expired'))
            )
        }
        const isUpdated = await this.usersRepository.confirmEmail(user._id)
        if (!isUpdated) {
            return new Result(
                StatusCode.ServerError,
                new ErrorsMessages(new FieldError('code', 'Confirmation code wasn\'t updated'))
            )
        }
        return new Result(StatusCode.NoContent)
    }

    async resendConfirmationCode(email: string) {
        const user = await this.usersRepository.findUserByLoginOrEmail(email)
        if (!user) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('email', 'Email is incorrect'))
            )
        }
        if (user.emailConfirmation.isConfirmed) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('email', 'Email is already confirmed'))
            )
        }
        const newCode = randomUUID()
        const info = await NodemailerService.sendEmail(email, 'Confirm your email', templateForRegistration(newCode))
        if (!info) {
            return new Result(
                StatusCode.ServerError,
                new ErrorsMessages(new FieldError('email', 'Error with sending email'))
            )
        }
        const isUpdated = await this.usersRepository.updateConfirmationCode(user._id, newCode)
        if (!isUpdated) {
            return new Result(
                StatusCode.ServerError,
                new ErrorsMessages(new FieldError('code', 'Confirmation code wasn\'t updated'))
            )
        }
        return new Result(StatusCode.NoContent)
    }

    async login(loginOrEmail: string, password: string, deviceName: string, clientIp: string): Promise<Result<TokensPayload>> {
        const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return new Result(
                StatusCode.Unauthorized,
                new ErrorsMessages(
                    new FieldError('login, email, password', 'Login, email or password is incorrect')
                )
            )
        }
        const isMatched = await BcryptService.comparePasswords(password, user.password)
        if (!isMatched) {
            return new Result(
                StatusCode.Unauthorized,
                new ErrorsMessages(
                    new FieldError('login, email, password', 'Login, email or password is incorrect')
                )
            )
        }
        const deviceId = new ObjectId()
        const tokens = await this.generateTokens(user, deviceId.toString())
        if (!tokens) {
            return new Result(StatusCode.ServerError, 'Error with generating or saving tokens')
        }
        const newDevice: DeviceDBModel = {
            _id: deviceId,
            userId: user._id.toString(),
            ip: clientIp,
            title: deviceName,
            creationDate: new Date().toISOString(),
            refreshToken: tokens.encryptedRefreshToken,
            lastActiveDate: new Date().toISOString(),
            expirationDate: add(new Date(), {
                seconds: 20
            }).toISOString(),
        }
        await DevicesRepository.addNewDevice(newDevice)
        return new Result(StatusCode.Success, null, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        })
    }

    async generateTokens(
        user: WithId<UserDBModel>,
        deviceId: string
    ): Promise<TokensPayload & { encryptedRefreshToken: string } | null> {
        const accessToken = this.jwtService.createToken(user, deviceId, 'access')
        const refreshToken = this.jwtService.createToken(user, deviceId, 'refresh')
        const encryptedRefreshToken = CryptoService.encrypt(refreshToken)
        return {accessToken, refreshToken, encryptedRefreshToken}
    }

    async updateTokens(refreshToken: string): Promise<Result<TokensPayload>> {
        const payload = await this.jwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            return new Result(StatusCode.Unauthorized)
        }
        const {user, device} = payload
        const tokens = await this.generateTokens(user, device._id.toString())
        if (!tokens) {
            return new Result(StatusCode.ServerError)
        }
        const deviceWithNewRefreshToken: DeviceDBModel = {
            ...device,
            refreshToken: tokens.encryptedRefreshToken,
            lastActiveDate: new Date().toISOString(),
            expirationDate: add(new Date(), {
                seconds: 20
            }).toISOString(),
        }
        debugger
        const isUpdated = await DevicesRepository.updateRefreshToken(deviceWithNewRefreshToken)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Success, null, {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        })
    }

    async logout(refreshToken: string): Promise<Result> {
        const payload = await this.jwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            return new Result(StatusCode.Unauthorized)
        }
        const isDeleted = await DevicesRepository.deleteDevice(payload.device._id.toString())
        if (!isDeleted) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }

    async recoverPassword(email: string): Promise<Result> {
        const user =  await this.usersRepository.findUserByLoginOrEmail(email)
        if (!user) {
            return new Result(StatusCode.NoContent)
        }
        const recoveryCode = randomUUID()
        const isAdded = await this.usersRepository.addRecoveryCode(user._id, recoveryCode)
        if (!isAdded) {
            return new Result(StatusCode.ServerError)
        }
        const isSent = await NodemailerService.sendEmail(email, 'Password recovery', templateForPasswordRecovery(recoveryCode))
        if (!isSent) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }

    async updatePassword(recoveryCode: string, newPassword: string): Promise<Result> {
        const user = await this.usersRepository.findUserByRecoveryCode(recoveryCode)
        if (!user) {
            return new Result(StatusCode.BadRequest)
        }
        const hashedPassword = await BcryptService.generateHash(newPassword)
        if (!hashedPassword) {
            return new Result(StatusCode.ServerError)
        }
        const isUpdated = await this.usersRepository.updatePassword(user._id, hashedPassword)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }
}