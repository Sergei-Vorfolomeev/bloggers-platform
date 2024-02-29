import {UserDBModel} from "../repositories/types";
import {UsersRepository} from "../repositories/users-repository";
import {BcryptService} from "./bcrypt-service";
import {Result, StatusCode} from "../utils/result";
import {JwtService} from "./jwt-service";
import {DevicesRepository} from "../repositories/devices-repository";
import {DeviceViewModel} from "./types";

export class UsersService {
    private usersRepository: UsersRepository
    private jwtService: JwtService

    constructor() {
        this.usersRepository = new UsersRepository()
        this.jwtService = new JwtService()
    }

    async createUser(login: string, email: string, password: string): Promise<Result<string>> {
        const hashedPassword = await BcryptService.generateHash(password)
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
        const devices = await DevicesRepository.findAllDevicesByUserId(payload.user._id.toString())
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
        const device = await DevicesRepository.findDeviceById(deviceId)
        if (!device) {
            return new Result(StatusCode.NotFound)
        }
        const userDevices = await DevicesRepository.findAllDevicesByUserId(user._id.toString())
        if (!userDevices) {
            return new Result(StatusCode.ServerError)
        }
        if (!userDevices.find(device => device._id.toString() === deviceId)) {
            return new Result(StatusCode.Forbidden)
        }
        const isDeleted = await DevicesRepository.deleteDeviceById(deviceId)
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
        const userDevices = await DevicesRepository.findAllDevicesByUserId(user._id.toString())
        if (!userDevices) {
            return new Result(StatusCode.ServerError)
        }
        userDevices.map(async (el) => {
            if (el._id.toString() !== device._id.toString()) {
                await DevicesRepository.deleteDeviceById(el._id.toString())
            }
        })
        return new Result(StatusCode.NoContent)
    }
}