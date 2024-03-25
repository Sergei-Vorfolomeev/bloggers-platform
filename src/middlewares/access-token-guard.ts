import {NextFunction, Request, Response} from "express";
import {JwtPayload} from "jsonwebtoken";
import {container} from "../composition-root";
import {JwtService} from "../services";
import {UsersQueryRepository} from "../repositories";

const jwtService = container.resolve(JwtService)
const usersQueryRepository = container.resolve(UsersQueryRepository)

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
    const payload: JwtPayload | null = await jwtService.verifyToken(token, 'access')
    if (!payload) {
        res.sendStatus(401)
        return
    }
    const user = await usersQueryRepository.getUserById(payload.userId)
    if (!user) {
        res.sendStatus(401)
        return
    }
    req.user = {id: user.id}
    next()
}