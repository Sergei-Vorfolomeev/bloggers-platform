import nodemailer from 'nodemailer'
import {settings} from "../settings";
import {injectable} from "inversify";

@injectable()
export class NodemailerService {
    async sendEmail(email: string, subject: string, message: string) {
        try {
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: settings.EMAIL,
                    pass: settings.PASSWORD,
                },
            });

            return await transporter.sendMail({
                from: "Sergey <vorfo1897@gmail.com>",
                to: email,
                subject: subject,
                html: message,
            })
        } catch (error) {
            console.error(error)
            return null
        }
    }
}