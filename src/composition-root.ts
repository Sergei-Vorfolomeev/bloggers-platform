import {
    UsersRepository,
    PostsRepository,
    BlogsRepository,
    CommentsRepository,
    UsersQueryRepository,
    BlogsQueryRepository,
    CommentsQueryRepository,
    PostsQueryRepository,
    DevicesRepository,
    LikesRepository,
    LikesQueryRepository,
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

export const usersRepository = new UsersRepository()
export const usersQueryRepository = new UsersQueryRepository()
export const blogsRepository = new BlogsRepository()
export const blogsQueryRepository = new BlogsQueryRepository()
export const postsRepository = new PostsRepository()
export const postsQueryRepository = new PostsQueryRepository(blogsQueryRepository)
export const commentsRepository = new CommentsRepository()
export const commentsQueryRepository = new CommentsQueryRepository(postsQueryRepository)
export const devicesRepository = new DevicesRepository()
export const likesRepository = new LikesRepository()
export const likesQueryRepository = new LikesQueryRepository()

export const cryptoService = new CryptoService()
export const nodemailerService = new NodemailerService()
export const bcryptService = new BcryptService()
export const jwtService = new JwtService(usersRepository, devicesRepository, cryptoService)
export const usersService = new UsersService(usersRepository, devicesRepository, jwtService, bcryptService)
export const authService = new AuthService(
    usersRepository,
    devicesRepository,
    nodemailerService,
    jwtService,
    bcryptService,
    cryptoService,
)
export const postsService = new PostsService(postsRepository, blogsRepository)
export const blogsService = new BlogsService(blogsRepository, postsService)
export const commentsService = new CommentsService(commentsRepository, usersRepository, postsRepository, likesRepository)

export const usersController = new UsersController(usersService, usersQueryRepository)
export const authController = new AuthController(authService, usersQueryRepository)
export const devicesController = new DevicesController(usersService)
export const blogsController = new BlogsController(blogsService, blogsQueryRepository, postsQueryRepository)
export const postsController = new PostsController(postsService, commentsService, postsQueryRepository, commentsQueryRepository)
export const commentsController = new CommentsController(commentsService, commentsQueryRepository, likesQueryRepository, usersService)
