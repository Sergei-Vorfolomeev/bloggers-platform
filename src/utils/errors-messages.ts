import {FieldErrorType} from "../routers/types";

export class ErrorsMessages {
    public errorsMessages: FieldErrorType[];
    constructor(...data: FieldErrorType[]) {
        this.errorsMessages = [...data]
    }
}

export class FieldError {
    public field: string;
    public message: string;
    constructor(field: string, message: string) {
        this.field = field
        this.message = message
    }
}