import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config()

// Сгенерируем ключ
const key = crypto.randomBytes(32); // 256 бит
// Сгенерируем инициализирующий вектор
const iv = crypto.randomBytes(16); // 128 бит

export const settings = {
    MONGO_URI: process.env.MONGO_URL || 'mongodb://localhost:27017',
    SECRET_KEY_1: process.env.SECRET_KEY_1 || '123',
    SECRET_KEY_2: process.env.SECRET_KEY_2 || '987',
    EMAIL: process.env.EMAIL || 'test@gmail.com',
    PASSWORD: process.env.PASSWORD || 'pass123',
    SECRET_KEY_FOR_CIPHER: key,
    INIT_VECTOR_FOR_CIPHER: iv
}