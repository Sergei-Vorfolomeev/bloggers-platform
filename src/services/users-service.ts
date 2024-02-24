import {UserDBModel} from "../repositories/types";
import {UsersRepository} from "../repositories/users-repository";
import {BcryptService} from "./bcrypt-service";
import {Result, StatusCode} from "../utils/result";
import {JwtService} from "./jwt-service";
import {DevicesRepository} from "../repositories/devices-repository";
import {DeviceViewModel} from "./types";

export class UsersService {
    static async createUser(login: string, email: string, password: string): Promise<Result<string>> {
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
        const createdUserId = await UsersRepository.createUser(newUser)
        if (!createdUserId) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Created, null, createdUserId)
    }

    static async deleteUser(id: string): Promise<Result> {
        const isDeleted = await UsersRepository.deleteUser(id)
        if (!isDeleted) {
            return new Result(StatusCode.NotFound)
        }
        return new Result(StatusCode.NoContent)
    }

    static async getDevices(refreshToken: string): Promise<Result<DeviceViewModel[]>> {
        const payload = await JwtService.verifyRefreshToken(refreshToken)
        if (!payload) {
            return new Result(StatusCode.Unauthorized)
        }
        const devices = await DevicesRepository.getAllDevicesByUserId(payload.user._id.toString())
        if (!devices) {
            return new Result(StatusCode.ServerError)
        }
        const devicesForClient: DeviceViewModel[] = devices.map(device => ({
            deviceId: device._id.toString(),
            title: device.title,
            ip: device.ip,
            lastActivateDate: device.lastActivateDate
        }))
        return new Result(StatusCode.Success, null, devicesForClient)
    }
}