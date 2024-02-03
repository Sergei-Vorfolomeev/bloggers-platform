import {db} from "../db/db";
import {PostInputModel} from "../db/db.types";

export const postsRepository = {
    getPosts: () => {
        return db.posts
    },

    getPostsById: (id: string) => {
        return db.posts.find(p => p.id === id)
    },

    deletePost: (id: string) => {
        const postIndex = db.posts.findIndex(p => p.id === id)
        if (postIndex > -1) {
            db.posts.splice(postIndex, 1)
            return true
        } else {
            return false
        }
    },

    createPost: (body: PostInputModel) => {
        const blog = db.blogs.find(b => b.id === body.blogId)
        if (blog) {
            const newPost = {
                id: Date.now().toString(),
                blogName: blog.name,
                ...body
            }
            db.posts.push(newPost)
            return newPost
        }
        return null
    },

    updatePost: (id: string, body: PostInputModel) => {
        const blog = db.blogs.find(b => b.id === body.blogId)
        if (blog) {
            const post = db.posts.find(p => p.id === id)
            if (post) {
                Object.assign(post, body)
                return true
            }
            return false
        }
        return false
    }
}