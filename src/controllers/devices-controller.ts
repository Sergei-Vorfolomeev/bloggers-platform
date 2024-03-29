import {UsersService} from "../services";
import {RequestType, RequestWithParams, ResponseType, ResponseWithBody} from "../routers/types";
import {DeviceViewModel} from "../services/types";
import {StatusCode} from "../utils/result";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";

@injectable()
export class DevicesController {
    constructor(@inject(UsersService) protected usersService: UsersService) {
    }

    async getDevices(req: RequestType, res: ResponseWithBody<DeviceViewModel[]>) {
        const refreshToken = req.cookies.refreshToken
        const {statusCode, data} = await this.usersService.getDevices(refreshToken)
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
    }

    async deleteDeviceById(req: RequestWithParams, res: ResponseType) {
        const refreshToken = req.cookies.refreshToken
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await this.usersService.deleteDeviceById(refreshToken, id)
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
    }

    async deleteDevices(req: RequestType, res: ResponseType) {
        const refreshToken = req.cookies.refreshToken
        const {statusCode} = await this.usersService.deleteOtherDevices(refreshToken)
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
    }
}