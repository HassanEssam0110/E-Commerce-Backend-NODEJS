import { sendMails } from "../services/mail.service.js";
import { otpMsgHTML } from "./mail-html.utils.js";

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

export const sentOTP = async ({ to, subject, otp, userName, textmessage } = {}) => {
    return await sendMails({
        to,
        subject,
        html: otpMsgHTML(otp, userName, textmessage)
    });

}