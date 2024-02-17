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
    errorMessage: string | null | undefined
    data: T | undefined
    constructor(statusCode: StatusCode, errorMessage?: string | null, data?: T) {
        this.statusCode = statusCode
        this.errorMessage = errorMessage
        this.data = data
    }
}