const nodemailer = require('nodemailer');


// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // or 465
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'ftp@speedlinkng.com', // your email
        pass: 'fcgvizklrnuszgnm' // your password
    }
});
// Send email
function sendMail(to, subject, message){

    // Email content
    const mailOptions = {
        from: 'support@speedlinkng.com', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: 'A new user named File Transfer has been created', // plain text body
        html: '<p>'+message+'</p>' // html body
    };

   
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred while sending email:', error);
        } else {
            console.log('Email successful:', info.response);
        }
    });
}
// Export the controller function
module.exports =  sendMail;
