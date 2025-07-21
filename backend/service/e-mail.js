const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({ 
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,  
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
    }
});

module.exports = transporter;
