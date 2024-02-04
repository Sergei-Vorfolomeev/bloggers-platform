import {ValidationError} from "express-validator";


export const formatError = (error: ValidationError) => {
    if (error.type === 'field') {
        return  {
            message: error.msg,
            field: error.path,
        }
    }
    return error
}