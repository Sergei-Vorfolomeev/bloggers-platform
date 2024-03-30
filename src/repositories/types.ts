import {ObjectId, SortDirection} from "mongodb";
import {CommentatorInfo, LikeStatus} from "../services/types";

export type PostDBModel = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type BlogDBModel = {
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type UserDBModel = {
    email: string
    login: string
    password: string
    createdAt: string
    emailConfirmation: EmailConfirmationType
    passwordRecovery?: {
        recoveryCode: string
    }
}

type EmailConfirmationType = {
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean
}

export type CommentDBModel = {
    content: string
    commentatorInfo: CommentatorInfo
    postId: string
    createdAt: string
    likesCount: number
    dislikesCount: number
}

export type LikeDBModel = {
    userId: string,
    postId?: string
    commentId?: string,
    likeStatus: LikeStatus,
}

export type DeviceDBModel = {
    _id: ObjectId
    userId: string
    ip: string
    title: string
    creationDate: string
    refreshToken: string
    lastActiveDate: string
    expirationDate: string
}

export type ConnectionDBModel = {
    ip: string
    routePath: string
    createdAt: Date
}

export type UsersSortParams = {
    searchLoginTerm: string | null
    searchEmailTerm: string | null
} & SortParams

export type BlogsSortParams = {
    searchNameTerm: string | null
} & SortParams

export type SortParams = {
    sortBy: string
    sortDirection: SortDirection
    pageNumber: number
    pageSize: number
}