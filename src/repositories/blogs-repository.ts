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
        const {name, description, websiteUrl} = body
        const newBlog = {
            id: Date.now().toString(),
            name, description, websiteUrl
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
        const {name, description, websiteUrl} = body
        const blog = db.blogs.find(b => b.id === id)
        if (blog) {
            Object.assign(blog, {
                name, description, websiteUrl
            })
            return true
        } else {
            return false
        }
    }
}
