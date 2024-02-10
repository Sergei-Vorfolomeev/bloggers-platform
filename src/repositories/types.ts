import {SortDirection} from "mongodb";

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