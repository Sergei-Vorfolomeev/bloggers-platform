import {Request, Response} from 'express'

type ParamsType = {
    id: string
}

export type RequestWithParams = Request<ParamsType, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithParamsAndBody<B> = Request<ParamsType, {}, B, {}>
export type RequestWithQuery<Q> = Request<ParamsType, {}, {}, Q>

export type ResponseWithBody<B> = Response<B>