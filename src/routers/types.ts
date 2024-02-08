import {Request, Response} from 'express'
import {SortDirection} from "mongodb";

type ParamsType = {
    id: string
}
export type QueryParams = {
    searchNameTerm?: string
    sortBy?: string
    sortDirection?: SortDirection
    pageNumber?: number
    pageSize?: number
}

export type RequestType = Request<{}, {}, {}, {}>
export type RequestWithParams = Request<ParamsType, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithParamsAndBody<B> = Request<ParamsType, {}, B, {}>
export type RequestWithQuery<Q> = Request<ParamsType, {}, {}, Q>

export type ResponseType = Response
export type ResponseWithBody<B> = Response<B>