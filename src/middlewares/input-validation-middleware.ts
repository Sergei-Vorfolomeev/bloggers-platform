import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {APIErrorResult} from "../routers/types";

export const inputValidationMiddleware = (req: Request, res: Response<APIErrorResult>, next: NextFunction) => {
    const formattedErrors = validationResult(req).formatWith(error => ({
        message: error.msg,
        field: error.type === 'field' ? error.path : 'unknown'
    }))
    if (!formattedErrors.isEmpty()) {
        const errorsMessages = formattedErrors.array({onlyFirstError: true})
        res.status(400).send({errorsMessages: errorsMessages})
    } else {
        next()
    }
}