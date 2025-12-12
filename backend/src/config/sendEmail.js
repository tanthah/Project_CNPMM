import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, text, html }) {
    try {
        // Tạo transporter với cấu hình từ .env
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        // Gửi email
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'UTE Shop'}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        })

        console.log('✅ Email đã gửi:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('❌ Lỗi khi gửi email:', error)
        return { success: false, error: error.message }
    }
}
