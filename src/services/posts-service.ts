import {PostInputModel} from "../routers/types";
import {LikeEntityDBModel, PostDBModel} from "../repositories/types";
import {BlogsRepository, LikesRepository, PostsRepository, UsersRepository} from "../repositories";
import {Result, StatusCode} from "../utils/result";
import {ErrorsMessages, FieldError} from "../utils/errors-messages";
import {LikeStatus} from "./types";

export class PostsService {
    constructor(
        protected postsRepository: PostsRepository,
        protected blogsRepository: BlogsRepository,
        protected usersRepository: UsersRepository,
        protected likesRepository: LikesRepository,
    ) {
    }
    async createPost(inputData: PostInputModel): Promise<Result<string>> {
        const {title, shortDescription, content, blogId} = inputData
        const blog = await this.blogsRepository.getBlogById(blogId)
        if (!blog) {
            return new Result(
                StatusCode.BadRequest,
                new ErrorsMessages(new FieldError('blogId', 'This blog doesn\'t exist'))
            )
        }
        const newPost: PostDBModel = {
            title, shortDescription, content, blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
            }
        }
        const createdPostId = await this.postsRepository.createPost(newPost)
        if (!createdPostId) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.Created, null, createdPostId)
    }

    async updatePost(id: string, inputData: PostInputModel): Promise<Result> {
        const {title, shortDescription, content, blogId} = inputData
        const post = await this.postsRepository.getPostById(id)
        if (!post) {
            return new Result(StatusCode.NotFound)
        }
        const newPost = {
            ...post,
            title, shortDescription, content, blogId
        }
        const isUpdated = await this.postsRepository.updatePost(id, newPost)
        if (!isUpdated) {
            return new Result(StatusCode.ServerError)
        }
        return new Result(StatusCode.NoContent)
    }

    async deletePost(id: string): Promise<Result> {
        const isDeleted = await this.postsRepository.deletePost(id)
        if (!isDeleted) {
            return new Result(StatusCode.NotFound)
        }
        return new Result(StatusCode.NoContent)
    }

    async updateLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<Result> {
        const user = await this.usersRepository.findUserById(userId)
        if (!user) {
            return new Result(StatusCode.Unauthorized)
        }
        const post = await this.postsRepository.getPostById(postId)
        if (!post) {
            return new Result(StatusCode.NotFound, 'The post with provided id hasn\'t been found')
        }
        // проверяем есть ли лайк юзера на посте
        const likeFromDB = await this.likesRepository.getPostLikeEntityByUserId(userId, postId)
        if (!likeFromDB) {
            const newLike: LikeEntityDBModel = {
                userId: user._id.toString(),
                login: user.login,
                postId,
                likeStatus,
                addedAt: new Date().toISOString()
            }
            let createdLikeId
            if (likeStatus === 'Like') {
                createdLikeId = post.addLike(postId, newLike)
            }
            if (likeStatus === 'Dislike') {
                createdLikeId = post.addDislike(postId, newLike)
            }
            if (likeStatus === 'None') {
                createdLikeId = true
            }
            if (!createdLikeId) {
                return new Result(StatusCode.ServerError, 'The like hasn\'t been created in the DB')
            }
            return new Result(StatusCode.NoContent)
        }
        switch (likeStatus) {
            case "None": {
                if (likeFromDB.likeStatus === 'Like') {
                    post.removeLike(postId, userId)
                }
                if (likeFromDB.likeStatus === 'Dislike') {
                    post.removeDislike(postId, userId)
                }
                return new Result(StatusCode.NoContent)
            }
            case "Like": {
                if (likeFromDB.likeStatus === 'Dislike') {
                    post.removeDislike(postId, userId)
                    const newLike: LikeEntityDBModel = {
                        userId: user._id.toString(),
                        login: user.login,
                        postId,
                        likeStatus,
                        addedAt: new Date().toISOString()
                    }
                    post.addLike(postId, newLike)
                }
                return new Result(StatusCode.NoContent)
            }
            case "Dislike": {
                if (likeFromDB.likeStatus === 'Like') {
                    post.removeLike(postId, userId)
                    const dislike: LikeEntityDBModel = {
                        userId: user._id.toString(),
                        login: user.login,
                        postId,
                        likeStatus,
                        addedAt: new Date().toISOString()
                    }
                    post.addDislike(postId, dislike)
                }
                return new Result(StatusCode.NoContent)
            }
        }
    }
}