import {Router} from "express";
import {devicesController} from "../composition-root";

export const devicesRouter = Router()

devicesRouter.get('/', devicesController.getDevices.bind(devicesController))
devicesRouter.delete('/:id', devicesController.deleteDeviceById.bind(devicesController))
devicesRouter.delete('/', devicesController.deleteDevices.bind(devicesController))
