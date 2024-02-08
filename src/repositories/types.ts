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

export type BlogsSortParams = {
    searchNameTerm: string | null
} & PostsSortParams

export type PostsSortParams = {
    sortBy: string
    sortDirection: SortDirection
    pageNumber: number
    pageSize: number
}