
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Config dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Email Configuration...');
console.log('User:', process.env.EMAIL_USER);
console.log('Pass length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Connection failed!');
        console.error(error);
    } else {
        console.log('✅ Server is ready to take our messages');

        // Try sending a mail
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Debug Script',
            text: 'It works!'
        }, (err, info) => {
            if (err) {
                console.error('❌ Failed to send mail:', err);
            } else {
                console.log('✅ Mail sent successfully:', info.messageId);
            }
        });
    }
});
