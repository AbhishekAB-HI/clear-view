

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
