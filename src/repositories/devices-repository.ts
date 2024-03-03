import {DeviceDBModel} from "./types";
import {ObjectId} from "mongodb";
import {DeviceModel} from "../db/mongoose/models/device.model";

export class DevicesRepository {

    async findDeviceById(deviceId: string): Promise<DeviceDBModel | null> {
        try {
            return DeviceModel.findById(new ObjectId(deviceId)).lean().exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async findAllDevicesByUserId(userId: string): Promise<DeviceDBModel[] | null> {
        try {
            return DeviceModel.find().where('userId').equals(userId).lean().exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async addNewDevice(device: DeviceDBModel): Promise<string | null> {
        try {
            const newDevice = new DeviceModel(device)
            await newDevice.save()
            return newDevice._id.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async updateRefreshToken(deviceWithNewRefreshToken: DeviceDBModel): Promise<boolean> {
        try {
            const res = await DeviceModel.updateOne(
                {_id: deviceWithNewRefreshToken._id},
                {$set: deviceWithNewRefreshToken}
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async deleteDevice(deviceId: string): Promise<boolean> {
        try {
            const res = await DeviceModel.deleteOne({_id: new ObjectId(deviceId)})
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async deleteDeviceById(deviceId: string): Promise<boolean> {
        try {
            const res = await DeviceModel.deleteOne({_id: new ObjectId(deviceId)})
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }
}