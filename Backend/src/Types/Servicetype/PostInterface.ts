
export interface ICounts {
  totalUsers: number;
  totalPosts: number;
  recentPosts: Ipostcount[];
}

export interface RecentPosts {
  recentPosts: Ipostcount[];
}

export interface Totalusers {
  totalUsers: number;
}
export interface TotalPosts {
  totalPosts: number;
}

export interface Ipostcount {
  description: string;
  likeCount: number;
  totalLikes: number;
  totalComments: number;
}

export interface MulterRequest extends Request {
  file: Express.Multer.File;
}