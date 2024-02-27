import {UserDBModel} from "./types";
import {ObjectId, WithId} from "mongodb";
import {UserModel} from "./models/user.model";

export class UsersRepository {
    static async findUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDBModel> | null> {
        return UserModel.findOne().or([{login: loginOrEmail}, {email: loginOrEmail}]).lean().exec()
    }

    static async createUser(user: UserDBModel): Promise<string | null> {
        try {
            const newUser = new UserModel(user)
            await newUser.save()
            return newUser._id.toString()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async deleteUser(id: string): Promise<boolean> {
        try {
            const res = await UserModel.deleteOne({_id: new ObjectId(id)})
            return res.deletedCount === 1
        } catch (e) {
            console.error(e)
            return false

        }
    }

    static async findByConfirmationCode(code: string): Promise<WithId<UserDBModel> | null> {
        try {
            return UserModel.findOne().where('emailConfirmation.confirmationCode').equals(code).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async confirmEmail(userId: ObjectId): Promise<boolean> {
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

    static async updateConfirmationCode(userId: ObjectId, newCode: string): Promise<boolean> {
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

    static async findUserById(userId: string): Promise<WithId<UserDBModel> | null> {
        try {
            return UserModel.findById(new ObjectId(userId)).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async addRecoveryCode(userId: ObjectId, recoveryCode: string): Promise<boolean> {
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

    static async findUserByRecoveryCode(recoveryCode: string): Promise<WithId<UserDBModel> | null> {
        try {
            return UserModel.findOne().where('passwordRecovery.recoveryCode').equals(recoveryCode).exec()
        } catch (e) {
            console.error(e)
            return null
        }
    }

    static async updatePassword(userId: ObjectId, hashedPassword: string) {
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
