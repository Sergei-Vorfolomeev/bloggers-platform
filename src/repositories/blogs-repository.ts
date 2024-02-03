import {db} from "../db/db";
import {BlogInputModel, BlogViewModel} from "../db/db.types";

export const blogsRepository = {
    getBlogs: () => {
        return db.blogs
    },
    getBlogById: (id: string) => {
        return db.blogs.find(b => b.id === id)
    },
    createBlog: (body: BlogInputModel): BlogViewModel => {
        const newBlog = {
            id: Date.now().toString(),
            ...body
        }
        db.blogs.push(newBlog)
        return newBlog
    },
    deleteBlog: (id: string) => {
        const blogIndex = db.blogs.findIndex(b => b.id === id)
        if (blogIndex > -1) {
            db.blogs.splice(blogIndex, 1)
            return true
        } else return false
    },
    updateBlog: (id: string, body: BlogInputModel) => {
        const blog = db.blogs.find(b => b.id === id)
        if (blog) {
            Object.assign(blog, body)
            return true
        } else {
            return false
        }
    }
}
