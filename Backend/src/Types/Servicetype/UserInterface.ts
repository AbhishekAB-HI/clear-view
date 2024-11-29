
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


export interface ActiveUsersType {
  userId: string;
  socketId: string;
}

export interface passwords extends Document {
  password: string;
  harshpassword: string;
}










