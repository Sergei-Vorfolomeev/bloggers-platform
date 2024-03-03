import {UserDBModel} from "./types";
import {ObjectId, WithId} from "mongodb";
import {UserModel} from "../db/mongoose/models/user.model";

export class UsersRepository {
    async findUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
        return UserModel.findOne().or([{login: loginOrEmail}, {email: loginOrEmail}]).lean().exec()
    }

    async createUser(user: UserDBModel): Promise<string | null> {
        try {
            const newUser = new UserModel(user)
            await newUser.save()
            return newUser._id.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async deleteUser(id: string): Promise<boolean> {
        try {
            const res = await UserModel.deleteOne({_id: new ObjectId(id)})
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false

        }
    }

    async findByConfirmationCode(code: string): Promise<WithId<UserDBModel> | null> {
        try {
            return UserModel.findOne().where('emailConfirmation.confirmationCode').equals(code).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async confirmEmail(userId: ObjectId): Promise<boolean> {
        try {
            const res = await UserModel.updateOne(
                {_id: userId},
                {'emailConfirmation.isConfirmed': true}
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async updateConfirmationCode(userId: ObjectId, newCode: string): Promise<boolean> {
        try {
            const res = await UserModel.updateOne(
                {_id: userId},
                {'emailConfirmation.confirmationCode': newCode}
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async findUserById(userId: string): Promise<WithId<UserDBModel> | null> {
        try {
            return UserModel.findById(new ObjectId(userId)).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async addRecoveryCode(userId: ObjectId, recoveryCode: string): Promise<boolean> {
        try {
            const res = await UserModel.updateOne(
                {_id: userId},
                {'passwordRecovery.recoveryCode': recoveryCode}
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async findUserByRecoveryCode(recoveryCode: string): Promise<WithId<UserDBModel> | null> {
        try {
            return UserModel.findOne().where('passwordRecovery.recoveryCode').equals(recoveryCode).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async updatePassword(userId: ObjectId, hashedPassword: string) {
        try {
            const res = await UserModel.updateOne(
                {_id: userId},
                {password: hashedPassword}
            )
            return res.matchedCount === 1
        } catch (e) {
            console.error(e)
            return false
        }
    }
}
