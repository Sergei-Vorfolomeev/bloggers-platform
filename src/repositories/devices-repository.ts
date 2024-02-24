import {DeviceDBModel} from "./types";
import {devicesCollection} from "../db/db";
import {ObjectId} from "mongodb";

export class DevicesRepository {

    static async addNewDevice(newDevice: DeviceDBModel): Promise<string | null> {
        try {
            const res = await devicesCollection.insertOne(newDevice)
            return res.insertedId.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async findDeviceById(deviceId: string): Promise<DeviceDBModel | null> {
        try {
            return await devicesCollection.findOne({_id: new ObjectId(deviceId)})
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async updateRefreshToken(deviceWithNewRefreshToken: DeviceDBModel): Promise<boolean> {
        try {
            const res = await devicesCollection.updateOne({_id: deviceWithNewRefreshToken._id}, {
                $set: deviceWithNewRefreshToken
            })
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    static async deleteDevice(deviceId: string): Promise<boolean> {
        try {
            const res = await devicesCollection.deleteOne({_id: new ObjectId(deviceId)})
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    static async getAllDevicesByUserId(userId: string): Promise<DeviceDBModel[] | null> {
        try {
           return await devicesCollection.find({userId}).toArray()
        } catch (e) {
            console.error(e)
            return null
        }
    }
}