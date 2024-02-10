import {UserDBModel} from "./types";
import {usersCollection} from "../db/db";
import {UserViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {userMapper} from "../utils/user-mapper";

export class UsersRepository {
    static async createUser(user: UserDBModel): Promise<string | null> {
       try {
            const res = await usersCollection.insertOne(user)
            return res.insertedId.toString()
        } catch (e) {
           console.error(e)
           return null
       }
    }
}