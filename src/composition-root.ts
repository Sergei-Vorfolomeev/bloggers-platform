import "reflect-metadata";
import { Container } from "inversify";
import {
    UsersRepository,
    PostsRepository,
    BlogsRepository,
    CommentsRepository,
    UsersQueryRepository,
    BlogsQueryRepository,
    CommentsQueryRepository,
    PostsQueryRepository, DevicesRepository
} from "./repositories";
import {
    UsersService,
    JwtService,
    AuthService,
    PostsService,
    CommentsService,
    BlogsService,
    NodemailerService,
    BcryptService,
    CryptoService,
} from "./services";
import {
    UsersController,
    BlogsController,
    CommentsController,
    PostsController,
    AuthController,
    DevicesController
} from "./controllers";

// export const usersRepository = new UsersRepository()
// export const usersQueryRepository = new UsersQueryRepository()
// export const blogsRepository = new BlogsRepository()
// export const blogsQueryRepository = new BlogsQueryRepository()
// export const postsRepository = new PostsRepository()
// export const postsQueryRepository = new PostsQueryRepository(blogsQueryRepository)
// export const commentsRepository = new CommentsRepository()
// export const commentsQueryRepository = new CommentsQueryRepository(postsQueryRepository)
// export const devicesRepository = new DevicesRepository()
//
// export const cryptoService = new CryptoService()
// export const nodemailerService = new NodemailerService()
// export const bcryptService = new BcryptService()
// export const jwtService = new JwtService(usersRepository, devicesRepository, cryptoService)
// export const usersService = new UsersService(usersRepository, devicesRepository, jwtService, bcryptService)
// export const authService = new AuthService(
//     usersRepository,
//     devicesRepository,
//     nodemailerService,
//     jwtService,
//     bcryptService,
//     cryptoService,
// )
// export const postsService = new PostsService(postsRepository, blogsRepository)
// export const blogsService = new BlogsService(blogsRepository, postsService)
// export const commentsService = new CommentsService(commentsRepository, usersRepository, postsRepository)
//
// export const usersController = new UsersController(usersService, usersQueryRepository)
// export const authController = new AuthController(authService, usersQueryRepository)
// export const devicesController = new DevicesController(usersService)
// //export const blogsController = new BlogsController(blogsService, blogsQueryRepository, postsQueryRepository)
// export const postsController = new PostsController(postsService, commentsService, postsQueryRepository, commentsQueryRepository)
// export const commentsController = new CommentsController(commentsService, commentsQueryRepository)

export const container = new Container()
container.bind(BlogsController).to(BlogsController)
container.bind(BlogsService).to(BlogsService)
container.bind(BlogsRepository).to(BlogsRepository)
container.bind(BlogsQueryRepository).to(BlogsQueryRepository)

container.bind(PostsController).to(PostsController)
container.bind(PostsService).to(PostsService)
container.bind(PostsRepository).to(PostsRepository)
container.bind(PostsQueryRepository).to(PostsQueryRepository)

container.bind(CommentsController).to(CommentsController)
container.bind(CommentsService).to(CommentsService)
container.bind(CommentsRepository).to(CommentsRepository)
container.bind(CommentsQueryRepository).to(CommentsQueryRepository)

container.bind(UsersController).to(UsersController)
container.bind(UsersService).to(UsersService)
container.bind(UsersRepository).to(UsersRepository)
container.bind(UsersQueryRepository).to(UsersQueryRepository)

container.bind(DevicesController).to(DevicesController)
container.bind(DevicesRepository).to(DevicesRepository)

container.bind(AuthController).to(AuthController)
container.bind(AuthService).to(AuthService)

container.bind(NodemailerService).to(NodemailerService)
container.bind(BcryptService).to(BcryptService)
container.bind(CryptoService).to(CryptoService)
container.bind(JwtService).to(JwtService)


