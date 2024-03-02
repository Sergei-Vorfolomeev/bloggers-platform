import {Router} from "express";
import {
    Paginator,
    RequestWithBody,
    RequestWithParams,
    RequestWithQuery,
    ResponseType,
    ResponseWithBody,
    UserInputModel,
    UsersQueryParams
} from "./types";
import {UserViewModel} from "../services/types";
import {userValidators} from "../validators/user-validators";
import {basicAuthGuard} from "../middlewares/basic-auth-guard";
import {UsersService} from "../services/users-service";
import {UsersQueryRepository} from "../repositories/users-query-repository";
import {ObjectId} from "mongodb";
import {StatusCode} from "../utils/result";
import {usersController} from "../composition-root";

export const usersRouter = Router()

export class UsersController {
    constructor(
        protected usersService: UsersService,
        protected usersQueryRepository: UsersQueryRepository,
    ) {
    }

    async getUsers(
        req: RequestWithQuery<UsersQueryParams>,
        res: ResponseWithBody<Paginator<UserViewModel[]>>
    ) {
        const {searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageSize, pageNumber} = req.query
        const sortParams = {
            searchLoginTerm: searchLoginTerm ?? null,
            searchEmailTerm: searchEmailTerm ?? null,
            sortBy: sortBy ?? 'createdAt',
            sortDirection: sortDirection ?? 'desc',
            pageSize: pageSize ? +pageSize : 10,
            pageNumber: pageNumber ? +pageNumber : 1,
        }
        const users = await this.usersQueryRepository.getUsers(sortParams)
        users
            ? res.status(200).send(users)
            : res.sendStatus(555)
    }

    async getUserById(req: RequestWithParams, res: ResponseWithBody<UserViewModel>) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const user = await this.usersQueryRepository.getUserById(id)
        user
            ? res.status(200).send(user)
            : res.sendStatus(404)
    }

    async createUser(req: RequestWithBody<UserInputModel>, res: ResponseWithBody<UserViewModel>) {
        const {login, email, password} = req.body
        const {statusCode, data: createdUserId} = await this.usersService.createUser(login, email, password)
        switch (statusCode) {
            case StatusCode.ServerError: {
                res.sendStatus(555);
                return
            }
            case StatusCode.Created: {
                const createdUser = await this.usersQueryRepository.getUserById(createdUserId!)
                createdUser
                    ? res.status(201).send(createdUser)
                    : res.sendStatus(400)
            }
        }
    }

    async deleteUser(req: RequestWithParams, res: ResponseType) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await this.usersService.deleteUser(id)
        switch (statusCode) {
            case StatusCode.NotFound: {
                res.sendStatus(404);
                return
            }
            case StatusCode.NoContent: {
                res.sendStatus(204)
                return
            }
        }
    }
}

usersRouter.get('/', usersController.getUsers.bind(usersController))
usersRouter.get('/:id', usersController.getUserById.bind(usersController))
usersRouter.post('/', basicAuthGuard, userValidators(), usersController.createUser.bind(usersController))
usersRouter.delete('/:id', basicAuthGuard, usersController.deleteUser.bind(usersController))