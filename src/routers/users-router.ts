import {Router} from "express";
import {userValidators} from "../validators/user-validators";
import {basicAuthGuard} from "../middlewares/basic-auth-guard";
import {container} from "../composition-root";
import {UsersController} from "../controllers";

export const usersRouter = Router()

const usersController = container.resolve(UsersController)

usersRouter.get('/', usersController.getUsers.bind(usersController))
usersRouter.get('/:id', usersController.getUserById.bind(usersController))
usersRouter.post('/', basicAuthGuard, userValidators(), usersController.createUser.bind(usersController))
usersRouter.delete('/:id', basicAuthGuard, usersController.deleteUser.bind(usersController))