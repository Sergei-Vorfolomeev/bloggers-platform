import bcrypt from "bcrypt";

export class BcryptService {
    static async generateHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10)
          //  .then(res => res)
    }
    static async compareHash(password: string, hashedPassword:string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword)
          //  .then(res => res)
    }
}