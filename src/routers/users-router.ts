import {Router} from "express";
import {
    Paginator,
    RequestWithBody, RequestWithParams,
    RequestWithQuery, ResponseType,
    ResponseWithBody,
    UserInputModel,
    UsersQueryParams
} from "./types";
import {UserViewModel} from "../services/types";
import {userValidator} from "../validators/user-validator";
import {basicAuthGuard} from "../middlewares/basic-auth-guard";
import {UsersService} from "../services/users-service";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {ObjectId} from "mongodb";

export const usersRouter = Router()

usersRouter.get('/',
    async (req: RequestWithQuery<UsersQueryParams>, res: ResponseWithBody<Paginator<UserViewModel[]>>) => {
        const {searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageSize, pageNumber} = req.query
        const sortParams = {
            searchLoginTerm: searchLoginTerm ?? null,
            searchEmailTerm: searchEmailTerm ?? null,
            sortBy: sortBy ?? 'createdAt',
            sortDirection: sortDirection ?? 'desc',
            pageSize: pageSize ? +pageSize : 10,
            pageNumber: pageNumber ? +pageNumber : 1,
        }
        const users = await UsersQueryRepository.getUsers(sortParams)
        users
            ? res.status(200).send(users)
            : res.sendStatus(555)
    })

usersRouter.get('/:id',
    async (req: RequestWithParams, res: ResponseWithBody<UserViewModel>) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const user = await UsersQueryRepository.getUserById(id)
        user
            ? res.status(200).send(user)
            : res.sendStatus(404)
    })

usersRouter.post('/',
    basicAuthGuard,
    userValidator(),
    async (req: RequestWithBody<UserInputModel>, res: ResponseWithBody<UserViewModel>) => {
        const {login, email, password} = req.body
        const user = await UsersService.createUser(login, email, password)
        user
            ? res.status(201).send(user)
            : res.sendStatus(400)
    })

usersRouter.delete('/:id',
    basicAuthGuard,
    async (req: RequestWithParams, res: ResponseType) => {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const isDeleted = await UsersService.deleteUser(id)
        isDeleted
            ? res.sendStatus(204)
            : res.sendStatus(404)
    })