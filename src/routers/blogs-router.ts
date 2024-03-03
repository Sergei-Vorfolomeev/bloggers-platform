import {Router} from "express";
import {basicAuthGuard} from "../middlewares/basic-auth-guard";
import {blogValidators} from "../validators/blog-validators";
import {postValidatorsWithoutBlogIdValidation} from "../validators/post-validators";
import {blogsController} from "../composition-root";

export const blogsRouter = Router()

blogsRouter.get('/', blogsController.getBlogs.bind(blogsController))
blogsRouter.get('/:id', blogsController.getBlogById.bind(blogsController))
blogsRouter.get('/:id/posts', blogsController.getPostsByBlogId.bind(blogsController))
blogsRouter.post('/', basicAuthGuard, blogValidators(), blogsController.createBlog.bind(blogsController))
blogsRouter.post(
    '/:id/posts',
    basicAuthGuard,
    postValidatorsWithoutBlogIdValidation(),
    blogsController.createPostWithinBlog.bind(blogsController)
)
blogsRouter.put('/:id', basicAuthGuard, blogValidators(), blogsController.updateBlog.bind(blogsController))
blogsRouter.delete('/:id', basicAuthGuard, blogsController.deleteBlog.bind(blogsController))