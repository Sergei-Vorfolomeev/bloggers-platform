import {Router} from "express";
import {container} from "../composition-root";
import {DevicesController} from "../controllers";

export const devicesRouter = Router()

const devicesController = container.resolve(DevicesController)

devicesRouter.get('/', devicesController.getDevices.bind(devicesController))
devicesRouter.delete('/:id', devicesController.deleteDeviceById.bind(devicesController))
devicesRouter.delete('/', devicesController.deleteDevices.bind(devicesController))
