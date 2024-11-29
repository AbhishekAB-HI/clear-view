
export interface IAllNotification {
  Follownotifications: IFollowNotification[];
  PostNotifications: IPostNotification[];
  LikeNotifications: ILikeNotifications[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFollowNotification {
  userId: string;
  userName: string;
  image: string;
  email: string;
  followuserId: string;
  timestamps: Date;
}

export interface IPostNotification {
  userId: string;
  postusername: string;
  image: string;
  content: string;
  email: string;
  followuserId: string;
  timestamps: Date;
}

export interface ILikeNotifications {
  postId: string;
  postuserId: string;
  likedusername: string;
  postcontent: string;
  userimage: string;
  postimage: string;
  email: string;
  likeduserId: string;
  likedstatus: string;
  timestamps: Date;
}
