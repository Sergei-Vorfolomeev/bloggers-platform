import {ErrorsMessages} from "./errors-messages";

export enum StatusCode {
    SUCCESS = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    SERVER_ERROR = 500
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