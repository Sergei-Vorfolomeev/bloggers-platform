import {BlogsService} from "../services";
import {BlogsQueryRepository, PostsQueryRepository} from "../repositories";
import {
    BlogInputModel,
    BlogsQueryParams,
    Paginator, PostInputModel, QueryParams, RequestWithBody,
    RequestWithParams, RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery, ResponseType,
    ResponseWithBody
} from "../routers/types";
import {BlogViewModel, PostViewModel} from "../services/types";
import {ObjectId} from "mongodb";
import {StatusCode} from "../utils/result";
import {inject, injectable} from "inversify";

@injectable()
export class BlogsController {
    constructor(
        @inject(BlogsService) protected blogsService: BlogsService,
        @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository,
        @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
    ) {
    }

    async getBlogs(req: RequestWithQuery<BlogsQueryParams>, res: ResponseWithBody<Paginator<BlogViewModel[]> | null>) {
        const {searchNameTerm, sortBy, sortDirection, pageNumber, pageSize} = req.query
        const sortParams = {
            searchNameTerm: searchNameTerm ?? null,
            sortBy: sortBy ?? 'createdAt',
            sortDirection: sortDirection ?? 'desc',
            pageNumber: pageNumber ? +pageNumber : 1,
            pageSize: pageSize ? +pageSize : 10,
        }
        const blogs = await this.blogsQueryRepository.getBlogs(sortParams)
        blogs
            ? res.status(200).send(blogs)
            : res.sendStatus(555)
    }

    async getBlogById(req: RequestWithParams, res: ResponseWithBody<BlogViewModel>) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const blog = await this.blogsQueryRepository.getBlogById(id)
        blog
            ? res.status(200).send(blog)
            : res.sendStatus(404)
    }

    async getPostsByBlogId(req: RequestWithParamsAndQuery<QueryParams>, res: ResponseWithBody<Paginator<PostViewModel[]> | null>) {
        const {id} = req.params
        const {sortBy, sortDirection, pageNumber, pageSize} = req.query
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const sortParams = {
            sortBy: sortBy ?? 'createdAt',
            sortDirection: sortDirection ?? 'desc',
            pageNumber: pageNumber ? +pageNumber : 1,
            pageSize: pageSize ? +pageSize : 10,
        }
        const posts = await this.postsQueryRepository.getPostsByBlogId(id, sortParams)
        posts
            ? res.status(200).send(posts)
            : res.sendStatus(404)
    }

    async createBlog(req: RequestWithBody<BlogInputModel>, res: ResponseType) {
        const {statusCode, data: createdBlogId} = await this.blogsService.createBlog(req.body)
        switch (statusCode) {
            case StatusCode.ServerError: {
                res.sendStatus(555);
                return
            }
            case StatusCode.Created: {
                const blog = await this.blogsQueryRepository.getBlogById(createdBlogId!)
                blog
                    ? res.status(201).send(blog)
                    : res.sendStatus(400)
            }
        }
    }

    async createPostWithinBlog(req: RequestWithParamsAndBody<Omit<PostInputModel, 'blogId'>>, res: ResponseType) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode, data: createdPostId} = await this.blogsService.createPostWithinBlog(id, req.body)
        switch (statusCode) {
            case StatusCode.BadRequest: {
                res.sendStatus(400);
                return
            }
            case StatusCode.NotFound: {
                res.sendStatus(404);
                return
            }
            case StatusCode.ServerError: {
                res.sendStatus(555);
                return
            }
            case StatusCode.Created: {
                const post = await this.postsQueryRepository.getPostById(createdPostId!)
                post
                    ? res.status(201).send(post)
                    : res.sendStatus(400)
            }
        }
    }

    async updateBlog(req: RequestWithParamsAndBody<BlogInputModel>, res: ResponseType) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await this.blogsService.updateBlog(id, req.body)
        switch (statusCode) {
            case StatusCode.NotFound: {
                res.sendStatus(404);
                return
            }
            case StatusCode.ServerError: {
                res.sendStatus(555);
                return
            }
            case StatusCode.NoContent: {
                res.sendStatus(204)
                return
            }
        }
    }

    async deleteBlog(req: RequestWithParams, res: ResponseType) {
        const {id} = req.params
        if (!ObjectId.isValid(id)) {
            res.sendStatus(404)
            return
        }
        const {statusCode} = await this.blogsService.deleteBlog(id)
        switch (statusCode) {
            case StatusCode.NotFound: {
                res.sendStatus(404);
                return
            }
            case StatusCode.NoContent: {
                res.sendStatus(204)
                return
            }
        }
    }
}