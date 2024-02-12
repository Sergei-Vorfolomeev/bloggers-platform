import {Request, Response, NextFunction} from "express";
import {HTTP_STATUS} from "../setting";

export const ADMIN_LOGIN = 'admin'
export const ADMIN_PASSWORD = 'qwerty'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization']

    if (!auth) {
        res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401)
        return
    }

    const [basic, token] = auth.split(' ')

    if (basic !== 'Basic') {
        res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401)
        return
    }

    const decodedToken = Buffer.from(token, 'base64').toString()
    const [login, password] = decodedToken.split(':')

    if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
        res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401)
        return
    }

    next()
}
