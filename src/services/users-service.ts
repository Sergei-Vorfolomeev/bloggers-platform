import {UserDBModel} from "../repositories/types";
import {BcryptService, JwtService} from "./index";
import {Result, StatusCode} from "../utils/result";
import {DeviceViewModel} from "./types";
import {DevicesRepository, UsersRepository} from "../repositories";

export class UsersService {
    constructor(
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected jwtService: JwtService,
        protected bcryptService: BcryptService,
    ) {}

    async getUserId(accessToken: string): Promise<string | null> {
        const payload = await this.jwtService.verifyToken(accessToken, 'access')
        if (!payload) {
            return null
        }
        const user = await this.usersRepository.findUserById(payload.userId)
        if (!user) {
            return null
        }
        return payload.userId
    }

    async createUser(login: string, email: string, password: string): Promise<Result<string>> {
        const hashedPassword = await this.bcryptService.generateHash(password)
        if (!hashedPassword) {
            return new Result(StatusCode.ServerError)
        }
        const newUser: UserDBModel = {
            login, email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: '',
                expirationDate: new Date(),
                isConfirmed: true
            },
        }
        const createdUserId = await this.usersRepository.createUser(newUser)
        if (!createdUserId) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Created, null, createdUserId)
    }

    async deleteUser(id: string): Promise<Result> {
        const isDeleted = await this.usersRepository.deleteUser(id)
        if (!isDeleted) {
            return new Result(StatusCode.NotFound)
        }
        return new Result(StatusCode.NoContent)
    }

    async getDevices(refreshToken: string): Promise<Result<DeviceViewModel[]>> {
        const payload = await this.jwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            return new Result(StatusCode.Unauthorized)
        }
        const devices = await this.devicesRepository.findAllDevicesByUserId(payload.user._id.toString())
        if (!devices) {
            return new Result(StatusCode.ServerError)
        }
        const devicesForClient: DeviceViewModel[] = devices.map(device => ({
            deviceId: device._id.toString(),
            title: device.title,
            ip: device.ip,
            lastActiveDate: device.lastActiveDate
        }))
        return new Result(StatusCode.Success, null, devicesForClient)
    }

    async deleteDeviceById(refreshToken: string, deviceId: string) {
        const payload = await this.jwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            return new Result(StatusCode.Unauthorized)
        }
        const {user} = payload
        const device = await this.devicesRepository.findDeviceById(deviceId)
        if (!device) {
            return new Result(StatusCode.NotFound)
        }
        const userDevices = await this.devicesRepository.findAllDevicesByUserId(user._id.toString())
        if (!userDevices) {
            return new Result(StatusCode.ServerError)
        }
        if (!userDevices.find(device => device._id.toString() === deviceId)) {
            return new Result(StatusCode.Forbidden)
        }
        const isDeleted = await this.devicesRepository.deleteDeviceById(deviceId)
        if (!isDeleted) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }

    async deleteOtherDevices(refreshToken: string) {
        const payload = await this.jwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            return new Result(StatusCode.Unauthorized)
        }
        const {user, device} = payload
        const userDevices = await this.devicesRepository.findAllDevicesByUserId(user._id.toString())
        if (!userDevices) {
            return new Result(StatusCode.ServerError)
        }
        userDevices.map(async (el) => {
            if (el._id.toString() !== device._id.toString()) {
                await this.devicesRepository.deleteDeviceById(el._id.toString())
            }
        })
        return new Result(StatusCode.NoContent)
    }
}