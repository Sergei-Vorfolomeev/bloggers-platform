import {NextFunction, Request, Response} from "express";
import {JwtService} from "../services/jwt-service";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {JwtPayload} from "jsonwebtoken";

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401)
        return
    }
    const [bearer, token] = req.headers.authorization.split(' ')
    if (bearer !== 'Bearer') {
        res.sendStatus(401)
        return
    }
    const payload: JwtPayload | null = await JwtService.verifyToken(token)
    if (!payload) {
        res.sendStatus(401)
        return
    }
    const user = await UsersQueryRepository.getUserById(payload.userId)
    if (!user) {
        res.sendStatus(401)
        return
    }
    req.user = {id: user.id}
    next()
}