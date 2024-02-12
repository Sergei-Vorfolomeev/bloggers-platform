import bcrypt from "bcrypt";

export class BcryptService {
    static async generateHash(password: string): Promise<string | null> {
        try {
            return await bcrypt.hash(password, 10)
        } catch (error) {
            console.error('Ошибка хеширования пароля:', error);
            return null
        }
    }

    static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hashedPassword)
        } catch (error) {
            console.error('Ошибка хеширования пароля:', error);
            return false
        }
    }
}