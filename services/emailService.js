const nodemailer = require("nodemailer");



async function sendMail({from, to, subject, text, html}){
     const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false,
          auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
     });

     const info = await transporter.sendMail({
          from:`inshare <${from}>`, // sender address
          to, // list of receivers
          subject, // Subject line
          text, // plain text body
          html, // html body
        });
      
        console.log("Message sent: %s", info.messageId);

}


module.exports = sendMail;