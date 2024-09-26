
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

 dotenv.config()

export const generateOtp = (): string => {
  const otp = crypto.randomInt(1000, 9999);
  return otp.toString();
};



export const sendVerifyMail = async (
  email: string,
  name:string,
  otpnew :string
 
): Promise<void> => {
  console.log("verify mail here");

  const mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.USEREMAIL as string,
      pass: process.env.USERPASSWORD as string,
    },
  });
  const mailDetails = {
    from: process.env.USEREMAIL as string,
    to: email,
    subject: `For verification mail`,
    html: "<p>Hi" + " " + name + ",Your otp number is :-" + otpnew + "",
  };

  try {
    await mailTransporter.sendMail(mailDetails);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
};




export const sendVerifyMailforemail = async (
  email: string | undefined,
  otpnew: string
): Promise<void> => {
  console.log("verify mail here");
  console.log(email,'email');
  console.log(otpnew, "otp new");
  if (!email) {
    console.error("No recipient email provided.");
    return;
  }
  const mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.USEREMAIL as string,
      pass: process.env.USERPASSWORD as string,
    },
  });
  const mailDetails = {
    from: process.env.USEREMAIL as string,
    to: email,
    subject: `For verification mail`,
    html: "<p>Hi ,Your otp number is :-" + otpnew + "",
  };

  try {
    await mailTransporter.sendMail(mailDetails);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
};
