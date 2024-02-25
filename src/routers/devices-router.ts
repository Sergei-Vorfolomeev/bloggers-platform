import {Router} from "express";
import {RequestType, RequestWithParams, ResponseType, ResponseWithBody} from "./types";
import {DeviceViewModel} from "../services/types";
import {UsersService} from "../services/users-service";
import {StatusCode} from "../utils/result";
import {ObjectId} from "mongodb";

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

devicesRouter.delete('/:id', async (req: RequestWithParams, res: ResponseType) => {
    const refreshToken = req.cookies.refreshToken
    const {id} = req.params
    if (!ObjectId.isValid(id)) {
        res.sendStatus(404)
        return
    }
    const {statusCode} = await UsersService.deleteDeviceById(refreshToken, id)
    switch (statusCode) {
        case StatusCode.Unauthorized: {
            res.sendStatus(401)
            return
        }
        case StatusCode.NotFound: {
            res.sendStatus(404)
            return
        }
        case StatusCode.Forbidden: {
            res.sendStatus(403)
            return
        }
        case StatusCode.ServerError: {
            res.sendStatus(555)
            return
        }
        case StatusCode.NoContent: {
            res.sendStatus(204)
            return
        }
    }
})

devicesRouter.delete('/', async (req: RequestType, res: ResponseType) => {
    const refreshToken = req.cookies.refreshToken
    const {statusCode} = await UsersService.deleteOtherDevices(refreshToken)
    switch (statusCode) {
        case StatusCode.Unauthorized: {
            res.sendStatus(401)
            return
        }
        case StatusCode.ServerError: {
            res.sendStatus(555)
            return
        }
        case StatusCode.NoContent: {
            res.sendStatus(204)
            return
        }
    }
})
