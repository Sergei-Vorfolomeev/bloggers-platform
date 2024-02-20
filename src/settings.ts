import dotenv from "dotenv";

dotenv.config()

export const settings = {
    MONGO_URI: process.env.MONGO_URL || 'mongodb://localhost:27017',
    SECRET_KEY_1: process.env.SECRET_KEY_1 || '123',
    SECRET_KEY_2: process.env.SECRET_KEY_2 || '987',
    EMAIL: process.env.EMAIL || 'test@gmail.com',
    PASSWORD: process.env.PASSWORD || 'pass123'
}