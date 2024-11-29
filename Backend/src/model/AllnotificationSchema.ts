import mongoose, { Schema } from "mongoose";
import { IUser } from "../entities/userEntities";
import { IAllNotification } from "../entities/Notificationentitities";

const AllnotificationSchema: Schema = new Schema(
  {
    Follownotifications: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
        userName: {
          type: String,
        },
        image: {
          type: String,
        },
        email: {
          type: String,
        },
        followuserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
      },
    ],
    PostNotifications: [
      {
        userId: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userdetail",
          },
        ],
        postusername: {
          type: String,
        },
        image: {
          type: [String],
        },
        content: {
          type: String,
        },
        email: {
          type: String,
        },
        followuserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
      },
    ],
    LikeNotifications: [
      {
        postId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "post",
        },
        postuserId: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userdetail",
          },
        ],
        likedusername: {
          type: String,
        },
        userimage: {
          type: [String],
        },
        postimage: {
          type: [String],
        },
        postcontent: {
          type: String,
        },
        email: {
          type: String,
        },
        likedstatus: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userdetail",
          },
        ],
        likeduserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userdetail",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const GetAllNotificationsSchema = mongoose.model<IAllNotification>(
  "NotificationSchema",
  AllnotificationSchema
);

export default GetAllNotificationsSchema;
