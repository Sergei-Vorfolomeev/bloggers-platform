export enum ResultCode {
    SUCCESS = 200,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    SERVER_ERROR = 500
}

export class Result<T = null> {
    resultCode: ResultCode;
    errorMessage: string | null | undefined
    data: T | undefined
    constructor(resultCode: ResultCode, errorMessage?: string | null, data?: T) {
        this.resultCode = resultCode
        this.errorMessage = errorMessage
        this.data = data
    }
}