import crypto from 'crypto'
import {settings} from "../settings";

export class CryptoService {
    static encrypt(data: string) {
        // Создадим шифратор
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            settings.SECRET_KEY_FOR_CIPHER,
            settings.INIT_VECTOR_FOR_CIPHER
        );
        // Зашифруем данные
        let encryptedData = cipher.update(data, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        return encryptedData
    }

    static decrypt(encryptedData: string) {
        // Создадим дешифратор
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            settings.SECRET_KEY_FOR_CIPHER,
            settings.INIT_VECTOR_FOR_CIPHER
        );
        // Дешифруем данные
        let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
        decryptedData += decipher.final('utf8');
        return decryptedData
    }
}