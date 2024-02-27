import mongoose from "mongoose";
import {DeviceDBModel} from "../types";

export const DeviceSchema = new mongoose.Schema<DeviceDBModel>({
    userId: {type: String, required: true},
    ip: {type: String, required: true},
    title: {type: String, required: true},
    creationDate: {type: String, required: true},
    refreshToken: {type: String, required: true},
    lastActiveDate: {type: String, required: true},
    expirationDate: {type: String, required: true},
})

export const DeviceModel = mongoose.model<DeviceDBModel>('device', DeviceSchema)