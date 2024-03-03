import {Router} from "express";
import {userValidators} from "../validators/user-validators";
import {basicAuthGuard} from "../middlewares/basic-auth-guard";
import {usersController} from "../composition-root";

export const usersRouter = Router()

usersRouter.get('/', usersController.getUsers.bind(usersController))
usersRouter.get('/:id', usersController.getUserById.bind(usersController))
usersRouter.post('/', basicAuthGuard, userValidators(), usersController.createUser.bind(usersController))
usersRouter.delete('/:id', basicAuthGuard, usersController.deleteUser.bind(usersController))