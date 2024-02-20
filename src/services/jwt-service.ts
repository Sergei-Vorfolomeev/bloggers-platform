import jwt, {JwtPayload} from 'jsonwebtoken'
import {UserDBModel} from "../repositories/types";
import {WithId} from "mongodb";
import {settings} from "../settings";

export class JwtService {
    static createToken(user: WithId<UserDBModel>, type: 'access' | 'refresh') {
        return jwt.sign(
            {userId: user._id.toString()},
            type === 'access' ? settings.SECRET_KEY_1 : settings.SECRET_KEY_2,
            {expiresIn: type === 'access' ? '10s' : '20s'}
        )
    }

    static async verifyToken(token: string, type: 'access' | 'refresh'): Promise<JwtPayload | null> {
        try {
            const secretKey = type === 'access' ? settings.SECRET_KEY_1 : settings.SECRET_KEY_2
            return jwt.verify(token, secretKey) as JwtPayload
        } catch (error) {
            console.error('Token verification has the following error: ' + error)
            return null
        }
    }
}