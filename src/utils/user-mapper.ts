import {UserDBModel} from "../repositories/types";
import {WithId} from "mongodb";
import {UserViewModel} from "../services/types";

export const userMapper = (user: WithId<UserDBModel>): UserViewModel => {
    return {
        id: user._id.toString(),
        email: user.email,
        login: user.login,
        createdAt: user.createdAt
    }
}