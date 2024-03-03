import mongoose from "mongoose";
import {ConnectionDBModel} from "../../../repositories/types";

export const ConnectionSchema = new mongoose.Schema<ConnectionDBModel>({
    ip: {type: String, required: true},
    routePath: {type: String, required: true},
    createdAt: {type: Date, required: true},
})

export const ConnectionModel = mongoose.model<ConnectionDBModel>('connections', ConnectionSchema)