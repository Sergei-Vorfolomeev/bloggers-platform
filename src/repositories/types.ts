import {ObjectId, SortDirection} from "mongodb";
import {CommentatorInfo} from "../services/types";

export type PostDBModel = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string
}

export type BlogDBModel = {
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string
    isMembership: boolean
}

export type UserDBModel = {
    email: string
    login: string
    password: string
    createdAt: string
    emailConfirmation: EmailConfirmationType
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
}

export type DeviceDBModel = {
    _id: ObjectId
    userId: string
    ip: string
    title: string
    creationDate: string
    refreshToken: string
    lastActivateDate: string
    expirationDate: string
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