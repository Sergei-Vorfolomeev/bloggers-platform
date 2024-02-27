import {Request, Response, NextFunction} from "express";
import {sub} from "date-fns/sub";
import {ConnectionDBModel} from "../repositories/types";
import {ConnectionModel} from "../repositories/models/connection.model";

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const {ip, originalUrl} = req
    const newConnectionDto: ConnectionDBModel = {
        ip: ip || 'unknown',
        routePath: originalUrl,
        createdAt: new Date(),
    }
    const limit = sub(new Date(), {
        seconds: 10
    })
    const newConnection = new ConnectionModel(newConnectionDto)
    await newConnection.save()
    const lastConnections = await ConnectionModel
        .countDocuments({
            ip: ip,
            routePath: originalUrl,
            createdAt: {$gte: limit}
        })
    if (lastConnections > 5) {
        res.sendStatus(429)
        return
    }
    next()
}