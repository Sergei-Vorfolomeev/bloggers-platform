import jwt, {JwtPayload} from 'jsonwebtoken'
import {UserDBModel} from "../repositories/types";
import {WithId} from "mongodb";
import {settings} from "../settings";

export class JwtService {
    static createToken(user: WithId<UserDBModel>) {
        return jwt.sign(
            {userId: user._id.toString()},
            settings.SECRET_KEY,
            {expiresIn: '24h'}
        )
    }
    static async verifyToken(token: string): Promise<JwtPayload | null> {
        try {
            return jwt.verify(token, settings.SECRET_KEY) as JwtPayload
        } catch (error) {
            console.error('Token verification has the following error: ' + error)
            return null
        }
    }
}