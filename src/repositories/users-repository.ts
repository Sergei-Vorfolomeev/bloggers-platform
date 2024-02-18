import {UserDBModel} from "./types";
import {usersCollection} from "../db/db";
import {ObjectId, WithId} from "mongodb";

export class UsersRepository {
    static async findUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
        const user = await usersCollection.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
        if (!user) {
            return null
        }
        return user
    }
    static async createUser(user: UserDBModel): Promise<string | null> {
        try {
            const res = await usersCollection.insertOne(user)
            return res.insertedId.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async deleteUser(id: string): Promise<boolean> {
        try {
            const res = await usersCollection.deleteOne({_id: new ObjectId(id)})
            return !!res.deletedCount
        } catch (e) {
            console.error(e)
            return false

        }
    }

    static async findByConfirmationCode(code: string) {
        try {
            return await usersCollection.findOne({'emailConfirmation.confirmationCode': {$eq: code}})
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async confirmEmail(userId: ObjectId): Promise<boolean | null> {
        try {
            const res = await usersCollection.updateOne({_id: userId}, {
                $set: {'emailConfirmation.isConfirmed': true}
            })
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async updateConfirmationCode(userId: ObjectId, newCode: string): Promise<boolean | null> {
        try {
            const res = await usersCollection.updateOne({_id: userId}, {
                $set: {'emailConfirmation.confirmationCode': newCode}
            })
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return null
        }
    }
}
