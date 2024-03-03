import {UserViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {userMapper} from "../utils/user-mapper";
import {UsersSortParams} from "./types";
import {Paginator} from "../routers/types";
import {UserModel} from "../db/mongoose/models/user.model";
import {injectable} from "inversify";

@injectable()
export class UsersQueryRepository {
    async getUsers(sortParams: UsersSortParams): Promise<Paginator<UserViewModel[]> | null> {
        try {
            const {searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageSize, pageNumber} = sortParams
            const filter: any = {}
            if (searchLoginTerm) {
                filter.$or = [
                    {login: {$regex: searchLoginTerm, $options: 'i'}}
                ];
            }
            if (searchEmailTerm) {
                if (filter.$or) {
                    filter.$or.push({email: {$regex: searchEmailTerm, $options: 'i'}});
                } else {
                    filter.$or = [
                        {email: {$regex: searchEmailTerm, $options: 'i'}}
                    ]
                }
            }
            const totalCount = await UserModel.countDocuments(filter)
            const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
            const users = await UserModel
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort({[sortBy]: sortDirection})
                .lean()
                .exec()
            return {
                items: users.map(userMapper),
                page: pageNumber,
                pageSize, pagesCount, totalCount
            }
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async getUserById(id: string): Promise<UserViewModel | null> {
        const user = await UserModel.findById(new ObjectId(id)).lean().exec()
        if (!user) {
            return null
        }
        return userMapper(user)
    }
}