export type BlogViewModel = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string
    isMembership: boolean
}

export type PostViewModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string
}