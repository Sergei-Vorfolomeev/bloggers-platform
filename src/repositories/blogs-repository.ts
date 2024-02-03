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
    }
}
