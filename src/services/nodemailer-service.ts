import nodemailer from 'nodemailer'
import {settings} from "../settings";

export const nodemailerService = async (receiver: string, subject: string, message: string) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: settings.EMAIL,
            pass: settings.PASSWORD,
        },
    });

    return await transporter.sendMail({
        from: "Sergey <vorfo1897@gmail.com>",
        to: receiver,
        subject: subject,
        html: message,
    })
}