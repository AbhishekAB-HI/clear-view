 import mongoose, {ObjectId, Types} from 'mongoose'
 
 export  interface IPost {
   _id: string;
   user: any;
   description: string;
   category: string;
   image: string;
   videos: string;
   likeCount: number;
   LikeStatement: boolean;
   likes: string[];
   comments: IComment[];
   userName: string;
 }

 export interface IComment {
  user: any;
  content: string;
  userName: string;
  timestamp: Date;
  parentComment: string;
  _id: string;
}

export interface ReplyingToState {
  postId: string;
  commentId: string;
}

export interface CreatePostHomeModalProps {
  togglepostModal: () => void;
  updatehomeState: () => void;
  userid: string | null;
}

export interface CreatePostModalProps {
  togglepostModal: () => void;
  updateState: () => void;
  userid: string | null;
}

export  interface userInfo {
  image: string;
  name?: string;
  email?: string;
  _id?: any;
}

export interface EditPostModalProps {
  toggleeditpostModal: () => void;
  updateState: () => void;
  postid: string | null;
}


export interface EditProfileModalProps {
  toggleModal: () => void;
  updateProfileState: () => void;
  userid: string | null;
}


export interface IUser  {
  _id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  isAdmin: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  image?: string;
  followers: IUser[];
  following: IUser[];
  blockedUser: IUser[];
  reportedUser: IReportUser[];
}
export interface IReportUser {
  userId: IUser;
  reportReason: string;
  image: string;
}



export interface IUser1 extends Document {
  _id: mongoose.Types.ObjectId;
}

 export interface ActiveUsersType {
   userId: string;
   socketId: string;
 }








export interface FormattedChat {
  chatName: string;
  lastMessage: string;
  lastMessageTime: Date;
}


export interface Message extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  image: string;
  videos: string;
  chat: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
}

export interface Chats {
  _id: ObjectId;
  chatName: string;
  isGroupchat: boolean;
  users: IUser[];
  latestMessage: Message;
  groupAdmin: IUser[];
}


export interface Notification extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  image: string;
  videos: string;
  isRead: boolean;
  chat: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
}



