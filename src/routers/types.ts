import {Request, Response} from 'express'
import {SortDirection} from "mongodb";

type ParamsType = {
    id: string
}
export type UsersQueryParams = {
    searchLoginTerm?: string
    searchEmailTerm?: string
} & QueryParams

export type BlogsQueryParams = {
    searchNameTerm?: string
} & QueryParams

export type QueryParams = {
    sortBy?: string
    sortDirection?: SortDirection
    pageNumber?: number
    pageSize?: number
}

export type RequestType = Request<{}, {}, {}, {}>
export type RequestWithParams = Request<ParamsType, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithParamsAndBody<B> = Request<ParamsType, {}, B, {}>
export type RequestWithParamsAndQuery<Q> = Request<ParamsType, {}, {}, Q>
export type RequestWithQuery<Q> = Request<ParamsType, {}, {}, Q>

export type ResponseType = Response
export type ResponseWithBody<B> = Response<B>

export type BlogInputModel = {
    name: string
    description: string
    websiteUrl: string
}

export type PostInputModel = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export type FieldError = {
    message: string
    field: string
}

export type APIErrorResult = {
    errorsMessages: FieldError[]
}

export type Paginator<T> = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: T
}

export type LoginInputModel = {
    loginOrEmail: string
    password: string
}

export type UserInputModel = {
    login: string
    email: string
    password: string
}

export type UserOutputModel = {
    login: string
    email: string
    userId: string
}

export type CommentInputModel = {
    content: string
}

export type RegistrationConfirmationCodeModel = {
    code: string
}

export type RegistrationEmailResendingModel = {
    email: string
}

