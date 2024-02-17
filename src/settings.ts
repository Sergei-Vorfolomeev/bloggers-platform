import dotenv from "dotenv";

dotenv.config()

export const settings = {
    MONGO_URI: process.env.MONGO_URL || 'mongodb://localhost:27017',
    SECRET_KEY: process.env.SECRET_KEY || '123',
    EMAIL: process.env.EMAIL || 'test@gmail.com',
    PASSWORD: process.env.PASSWORD || 'pass123'
}