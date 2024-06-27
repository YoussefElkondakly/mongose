const nodemailer = require('nodemailer');

const sendEmail = async (opt) => {
    // console.log("You are In Function with the ", opt);

    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 587, // or 465
        auth: {
            user: "30c2967bf9dad8",
            pass: "8fcaad818bd8e2"
        },
        secure: false, // use TLS
        tls: {
            rejectUnauthorized: false // disable certificate verification
        },
        debug: true, // show debug output
        logger: true // log information in console
    });

    const mailOpts = {
        from: "Youssef Developer <no-reply@example.com>",
        to: opt.email,
        subject: opt.subject,
        text: opt.message,
    };
    // console.log(mailOpts);

   
        await transport.sendMail(mailOpts);
      
    
};

module.exports = sendEmail;
