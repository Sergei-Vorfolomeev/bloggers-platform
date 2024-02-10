import {Router} from "express";
import {
    Paginator,
    RequestWithBody,
    RequestWithQuery,
    ResponseWithBody,
    UserInputModel,
    UsersQueryParams
} from "./types";
import {UserViewModel} from "../services/types";
import {userValidator} from "../validators/user-validator";
import {authMiddleware} from "../middlewares/auth-middleware";
import {UsersService} from "../services/users-service";
import {UsersQueryRepository} from "../repositories/users-query-repository";

export const usersRouter = Router()

usersRouter.get('/', async (req: RequestWithQuery<UsersQueryParams>, res: ResponseWithBody<Paginator<UserViewModel[]>>) => {
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

usersRouter.post('/',
    authMiddleware,
    userValidator(),
    async (req: RequestWithBody<UserInputModel>, res: ResponseWithBody<UserViewModel>) => {
        const {login, email, password} = req.body
        const user = await UsersService.createUser(login, email, password)
        user
            ? res.status(201).send(user)
            : res.sendStatus(400)
    })