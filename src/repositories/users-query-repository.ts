import {UserViewModel} from "../services/types";
import {usersCollection} from "../db/db";
import {ObjectId, WithId} from "mongodb";
import {userMapper} from "../utils/user-mapper";
import {UserDBModel, UsersSortParams} from "./types";
import {Paginator} from "../routers/types";

export class UsersQueryRepository {
    static async getUsers(sortParams: UsersSortParams): Promise<Paginator<UserViewModel[]> | null> {
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
            const totalCount = await usersCollection.countDocuments(filter)
            const pagesCount = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
            const users = await usersCollection
                .find(filter)
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .sort(sortBy, sortDirection)
                .toArray()
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

    static async getUserById(id: string): Promise<UserViewModel | null> {
        const user = await usersCollection.findOne({_id: new ObjectId(id)})
        if (!user) {
            return null
        }
        return userMapper(user)
    }

    static async getUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
        const user = await usersCollection.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
        if (!user) {
            return null
        }
        return user
    }
}


// if (searchLoginTerm) {
//     const propertyForFilter = {
//         login: {
//             $regex: searchLoginTerm,
//             $options: 'i'
//         }
//     }
//     Object.assign(filter, propertyForFilter)
// }
// if (searchEmailTerm) {
//     const propertyForFilter = {
//         email: {
//             $regex: searchEmailTerm,
//             $options: 'i'
//         }
//     }
//     Object.assign(filter, propertyForFilter)
// }