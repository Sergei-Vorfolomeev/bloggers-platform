import {NextFunction, Request, Response} from "express";

export const ADMIN_LOGIN = 'admin'
export const ADMIN_PASSWORD = 'qwerty'

export const basicAuthGuard = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization']

    if (!auth) {
        res.sendStatus(401)
        return
    }

    const [basic, token] = auth.split(' ')

    if (basic !== 'Basic') {
        res.sendStatus(401)
        return
    }

    const decodedToken = Buffer.from(token, 'base64').toString()
    const [login, password] = decodedToken.split(':')

    if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
        res.sendStatus(401)
        return
    }

    next()
}
