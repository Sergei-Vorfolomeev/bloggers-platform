import jwt, {JwtPayload} from 'jsonwebtoken'
import {UserDBModel} from "../repositories/types";
import {WithId} from "mongodb";
import {settings} from "../settings";
import {CryptoService} from "./crypto-service";
import {DevicesRepository, UsersRepository} from "../repositories";

export class JwtService {
    constructor(
        protected usersRepository: UsersRepository,
        protected devicesRepository: DevicesRepository,
        protected cryptoService: CryptoService,
    ) {}
    createToken(user: WithId<UserDBModel>, deviceId: string, type: 'access' | 'refresh') {
        return jwt.sign(
            {
                userId: user._id.toString(),
                deviceId
            },
            type === 'access' ? settings.SECRET_KEY_1 : settings.SECRET_KEY_2,
            {expiresIn: type === 'access' ? '10s' : '20s'}
        )
    }

    async verifyToken(token: string, type: 'access' | 'refresh'): Promise<JwtPayload | null> {
        try {
            const secretKey = type === 'access' ? settings.SECRET_KEY_1 : settings.SECRET_KEY_2
            return jwt.verify(token, secretKey) as JwtPayload
        } catch (error) {
            console.error('Token verification has the following error: ' + error)
            return null
        }
    }

    async verifyRefreshToken(refreshToken: string) {
        const payload = await this.verifyToken(refreshToken, 'refresh')
        if (!payload) {
            return null
        }
        const {userId, deviceId} = payload
        const user = await this.usersRepository.findUserById(userId)
        if (!user) {
            return null
        }
        const device = await this.devicesRepository.findDeviceById(deviceId)
        if (!device) {
            return null
        }
        const decryptedRefreshToken = this.cryptoService.decrypt(device.refreshToken)
        const isMatched = refreshToken === decryptedRefreshToken
        if (!isMatched) {
            return null
        }
        return {user, device}
    }
}