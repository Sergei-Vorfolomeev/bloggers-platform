import {Request, Response, NextFunction} from "express";
import {connectionsCollection} from "../db/db";
import {sub} from "date-fns/sub";
import {ConnectionDBModel} from "../repositories/types";

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const {ip, originalUrl} = req
    const newConnection: ConnectionDBModel = {
        ip: ip || 'unknown',
        routePath: originalUrl,
        createdAt: new Date(),
    }
    const limit = sub(new Date(), {
        seconds: 10
    })

    await connectionsCollection.insertOne(newConnection)
    const lastConnections = await connectionsCollection
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