import mongoose from "mongoose";


export interface TokenResponce {
  accessToken: string;
  refreshToken: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserVerify {
  email: string;
  otp: string;
}


export interface ICounts {
  totalUsers: number;
  totalPosts: number;
}


 export interface ActiveUsersType {
   userId: string;
   socketId: string;
 }


