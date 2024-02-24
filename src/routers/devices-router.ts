import {Router} from "express";
import {RequestType, ResponseWithBody} from "./types";
import {DeviceViewModel} from "../services/types";
import {UsersService} from "../services/users-service";
import {StatusCode} from "../utils/result";

export const devicesRouter = Router()

devicesRouter.get('/', async (req: RequestType, res: ResponseWithBody<DeviceViewModel[]>) => {
    const refreshToken = req.cookies.refreshToken
    const {statusCode, data} = await UsersService.getDevices(refreshToken)
    switch (statusCode) {
        case StatusCode.Unauthorized: {
            res.sendStatus(401)
            return
        }
        case StatusCode.ServerError: {
            res.sendStatus(555)
            return
        }
        case StatusCode.Success: {
            res.status(200).send(data)
            return
        }
    }
})
