import {Request, Response, Router} from "express";
import {postsRepository} from "../repositories/posts-repository";
import {PostInputModel, PostViewModel} from "../db/db.types";
import {authMiddleware} from "../middlewares/auth-middleware";
import {HTTP_STATUS} from "../setting";
import {postValidators} from "../validators/post-validators";

export const postsRouter = Router()

postsRouter.get('/', (req: Request, res: Response) => {
    const posts = postsRepository.getPosts()
    res.status(HTTP_STATUS.OK_200).send(posts)
})

postsRouter.get('/:id', (req: Request, res: Response) => {
    const post = postsRepository.getPostsById(req.params.id)
    if (post) {
        res.status(HTTP_STATUS.OK_200).send(post)
    } else {
        res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    }
})

postsRouter.delete('/:id', authMiddleware, (req: Request, res: Response) => {
    const isDeleted = postsRepository.deletePost(req.params.id)
    if (isDeleted) {
        res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
    } else {
        res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    }
})

postsRouter.post('/', authMiddleware, postValidators(),
    (req: Request<any, PostViewModel, PostInputModel>, res: Response<PostViewModel>) => {
        const newPost = postsRepository.createPost(req.body)
        newPost
            ? res.status(HTTP_STATUS.CREATED_201).send(newPost)
            : res.sendStatus(HTTP_STATUS.BAD_REQUEST_400)
    })

postsRouter.put('/:id', authMiddleware, postValidators(),
    (req: Request<any, any, PostInputModel>, res: Response) => {
        const isUpdated = postsRepository.updatePost(req.params.id, req.body)
        isUpdated
            ? res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
            : res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
    })