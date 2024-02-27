import mongoose from "mongoose";
import {UserDBModel} from "../types";

export const UserSchema = new mongoose.Schema<UserDBModel>({
    email: {type: String, required: true},
    login: {type: String, required: true},
    password: {type: String, required: true},
    createdAt: {type: String, required: true},
    emailConfirmation: {
        confirmationCode: String,
        expirationDate: {type: Date, required: true},
        isConfirmed: {type: Boolean, required: true},
    },
    passwordRecovery: {
        recoveryCode: String
    }
})

export const UserModel = mongoose.model<UserDBModel>('user', UserSchema)