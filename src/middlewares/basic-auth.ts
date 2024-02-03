import expressBasicAuth from "express-basic-auth";

export const authMiddleware = expressBasicAuth({
    users: {
        admin: 'qwerty'
    },
    challenge: true, // Для отправки запроса аутентификации, если данные не предоставлены
    unauthorizedResponse: 'Unauthorized'
})