export type BlogViewModel = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string
    isMembership: boolean
}

export type PostViewModel = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
    extendedLikesInfo: ExtendedLikesInfoViewModel
}

export type UserViewModel = {
    id: string
    email: string
    login: string
    createdAt?: string
}

export type CommentViewModel = {
    id: string
    content: string
    commentatorInfo: CommentatorInfo
    createdAt: string
    likesInfo: LikesInfoViewModel
}

export type CommentatorInfo = {
    userId: string
    userLogin: string
}

export type LikesInfoViewModel = {
    likesCount: number
    dislikesCount: number
    myStatus: LikeStatus
}

export type ExtendedLikesInfoViewModel = LikesInfoViewModel & {
    newestLikes: LikeDetailsViewModel[]
}

export type LikeDetailsViewModel = {
    addedAt: string
    userId: string
    login: string
}

export type LikeStatus = "None" | "Like" | "Dislike"

export type DeviceViewModel = {
    deviceId: string
    ip: string
    title: string
    lastActiveDate: string
}

export type TokensPayload = {
    accessToken: string
    refreshToken: string
}

