export type DBType = {
	blogs: BlogViewModel[];
	posts: PostViewModel[];
}
export type BlogInputModel = {
	name: string
	description: string
	websiteUrl: string
}

export type BlogViewModel = {
	id: string;
	name: string;
	description: string;
	websiteUrl: string;
	createdAt: string
	isMembership: boolean
}

export type BlogDBModel = {
	name: string;
	description: string;
	websiteUrl: string;
	createdAt: string
	isMembership: boolean
}

export type PostInputModel = {
	title: string
	shortDescription: string
	content: string
	blogId: string
}

export type PostDBModel = {
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
	createdAt: string
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

export type FieldError = {
	message: string
	field: string
}
export type APIErrorResult = {
	errorsMessages: FieldError[]
}

export type Paginator<T> = {
	pagesCount: number
	page: number
	pageSize: number
	totalCount: number
	items: T
}

