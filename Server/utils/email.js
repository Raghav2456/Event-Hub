const nodemailer = require('nodemailer');   
const dotenv = require('dotenv');  // Load environment variables from .env file
dotenv.config();

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");
// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send an email
const sendEmail = async (userEmail, userName, eventTiltle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed : ${eventTiltle}`,
            html: `
            <h2> Hello ${userName},</h2>
            <p> Your booking for the event <strong>${eventTiltle}</strong> has been confirmed. </p>
            <p> Thank you for booking with us! </p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail}`);
    } 
    catch (error) {
        console.error(`Error sending email to ${userEmail}:`, error);
        throw new Error('Failed to send email');
    }
};

// Function to send OTP email
exports.sendOtpEmail = async (email, otp, type) => {

    try {
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP for ${type} is: ${otp}. It will expire in 5 minutes.`
    };

    await transporter.sendMail(mailOptions);  
    console.log(`OTP email sent to ${email} for ${type}`);
    }
    
    // if there is an error while sending the email, log it and throw an error
    catch (error) {
        console.error(`Error sending OTP email to ${email}:`, error);
        throw new Error('Failed to send OTP email');
    }
};