import {UsersRepository} from "./repositories/users-repository";
import {UsersService} from "./services/users-service";
import {JwtService} from "./services/jwt-service";
import {UsersController} from "./routers/users-router";
import {AuthService} from "./services/auth-service";
import {AuthController} from "./routers/auth-router";
import {DevicesController} from "./routers/devices-router";
import {PostsRepository} from "./repositories/posts-repository";
import {PostsController} from "./routers/posts-router";
import {PostsService} from "./services/posts-service";
import {BlogsRepository} from "./repositories/blogs-repository";
import {CommentsService} from "./services/comments-service";
import {CommentsRepository} from "./repositories/comments-repository";
import {CommentsController} from "./routers/comments-router";
import {BlogsController} from "./routers/blogs-router";
import {BlogsService} from "./services/blogs-service";
import {UsersQueryRepository} from "./repositories/users-query-repository";
import {BlogsQueryRepository} from "./repositories/blogs-query-repository";
import {CommentsQueryRepository} from "./repositories/comments-query-repository";
import {PostsQueryRepository} from "./repositories/posts-query-repository";

export const usersRepository = new UsersRepository()
export const usersQueryRepository = new UsersQueryRepository()
export const blogsRepository = new BlogsRepository()
export const blogsQueryRepository = new BlogsQueryRepository()
export const postsRepository = new PostsRepository()
export const postsQueryRepository = new PostsQueryRepository(blogsQueryRepository)
export const commentsRepository = new CommentsRepository()
export const commentsQueryRepository = new CommentsQueryRepository(postsQueryRepository)

export const jwtService = new JwtService(usersRepository)
export const usersService = new UsersService(usersRepository, jwtService)
export const authService = new AuthService(usersRepository, jwtService)
export const postsService = new PostsService(postsRepository, blogsRepository)
export const blogsService = new BlogsService(blogsRepository, postsService)
export const commentsService = new CommentsService(commentsRepository, usersRepository, postsRepository)

export const authController = new AuthController(authService, usersQueryRepository)
export const usersController = new UsersController(usersService, usersQueryRepository)
export const devicesController = new DevicesController(usersService)
export const blogsController = new BlogsController(blogsService, blogsQueryRepository, postsQueryRepository)
export const postsController = new PostsController(postsService, commentsService, postsQueryRepository, commentsQueryRepository)
export const commentsController = new CommentsController(commentsService, commentsQueryRepository)
