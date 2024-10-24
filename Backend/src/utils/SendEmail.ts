import nodemailer from "nodemailer";
import dotenv from 'dotenv'

dotenv.config()
const sendEmail = async (to: string, message: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service
    auth: {
      user: process.env.USEREMAIL as string,
      pass: process.env.USERPASSWORD as string,
    },
  });

  const mailOptions = {
    from: process.env.USEREMAIL as string,
    to: process.env.USEREMAIL as string,
    subject: "Birthday Reminder",
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
