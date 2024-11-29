import { Profile } from "passport";

export interface User {
  id?: string;
  email?: string;
  displayName?: string;
}

export interface GoogleProfile extends Profile {
  email?: string;
}



export interface AuthenticatedRequest {
  user?: {
    email?: string;
    displayName?: string;
  };
}














