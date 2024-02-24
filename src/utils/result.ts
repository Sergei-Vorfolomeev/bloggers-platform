import {ErrorsMessages} from "./errors-messages";

export enum StatusCode {
    Success,
    Created,
    NoContent,
    Unauthorized,
    Forbidden,
    BadRequest,
    NotFound,
    ServerError,
}

export class Result<T = null> {
    statusCode: StatusCode;
    errorsMessages: ErrorsMessages | string | null | undefined
    data: T | undefined
    constructor(statusCode: StatusCode, errorsMessages?: ErrorsMessages | string | null, data?: T) {
        this.statusCode = statusCode
        this.errorsMessages = errorsMessages
        this.data = data
    }
}