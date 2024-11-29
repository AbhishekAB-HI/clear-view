import express from "express";
import cors from "cors";
import userRouter from "./Routes/userRoutes";
import connectDB from "./config/Db";
import adminRouter from "./Routes/adminRouter";
import passportauth from "./Googleauth/Passport";
import session from "express-session";
import googleauthRoutes from "./Routes/googleRoute";
import chatRoutes from "./Routes/ChatRoute";
import messageRoute from "./Routes/messageRoute";
import jwt from "jsonwebtoken";
import logger from "./logger";
import morgan from "morgan";
import { Socket } from "socket.io";

import { ActiveUsersType } from "./Types/Servicetype/UserInterface";
import { NewMessage } from "./Types/Servicetype/MessageInterface";
import { IAllNotification } from "./entities/Notificationentitities";
import { IUser } from "./entities/userEntities";
import { Posts } from "./entities/Postentities";

const morganFormat = ":method :url :status :response-time ms";
const app = express();
connectDB();

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

const port = 3000;

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, refresh-token"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

app.use(passportauth.initialize());
app.use(passportauth.session());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use("/api/user", userRouter);
app.use("/", googleauthRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoute);

const server = app.listen(port, () => {
  console.log(`server is running at :- ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  //  The server is waiting for the connection 60 sec in not connectc it will be disconnect
  cors: {
    origin: "http://localhost:5173",
  },
});

let activeUsers = [] as ActiveUsersType[];

io.on("connection", (socket: Socket) => {
  console.log("connection to socket.io");
  socket.on("setup", (userdata: string) => {
    const decoded = jwt.verify(userdata, "key_for_accesst") as {
      id: string;
    };
    let userId = decoded.id;
    socket.join(userId);
    socket.emit("connected");

    if (!activeUsers.some((user) => user.userId === userId)) {
      activeUsers.push({ userId: userId, socketId: socket.id });
    }
    console.log("11111111111111111111111111111111111111111");
    io.emit("get-users", activeUsers);
  });

  socket.on("logout", (userId) => {
    activeUsers = activeUsers.filter((user) => user.userId !== userId);
    io.emit("get-users", activeUsers);
  });

  socket.on("join chat", (room: string) => {
    socket.join(room);
    console.log("User joined Room : " + room);
  });

  socket.on("sendNotification", (data) => {
    const { userId, notification } = data;
    io.to(userId).emit("receiveNotification", notification);
  });

  socket.on("typing", (room: string) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room: string) =>
    socket.in(room).emit("stop typing")
  );

  socket.on("new message", (newMessageReceived: NewMessage) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      return console.log("chat.user not defined");
    }
    chat.users.forEach((user: string) => {
      if (user === newMessageReceived.sender._id) return;
      io.emit("hello", "hai");

      socket.in(user).emit("message received", newMessageReceived);
      socket.in(user).emit("notification received", newMessageReceived);
    });
  });

  socket.on(
    "following",
    (
      followuserId: string,
      logeduserinfo: IUser,
      followingUser: IAllNotification
    ) => {
      logeduserinfo.following.map((user: any) => {
        if (user === followuserId) {
          socket
            .in(user)
            .emit(
              "follow received",
              logeduserinfo,
              followingUser,
              followuserId
            );
        }
      });
    }
  );

  socket.on("likepost", (postDetails: IAllNotification) => {
    postDetails?.LikeNotifications?.forEach((like) => {
      const targetUserId = like.postuserId;
      const posteduserid = like.likeduserId;
      if (targetUserId != posteduserid) {
        io.to(targetUserId).emit("Likenotification", postDetails);
        console.log(`Notification sent to user ${targetUserId}`);
      } else {
        console.log(`User ${targetUserId} is not online`);
      }
    });
  });

  socket.on(
    "newpost",
    (postedUserInfo: Posts, postdetails: IAllNotification) => {
      console.log("New post received from:", postedUserInfo);
      console.log("postedUserInfo.user.followers", postedUserInfo.user);
      const followers = postedUserInfo.user.followers || [];
      followers.forEach((followerId: any) => {
        io.to(followerId).emit("post update", postedUserInfo, postdetails);
      });

      socket.emit("post received", {
        status: "success",
        message: "Post has been received and processed.",
      });
    }
  );

  socket.off("setup", (userdata: string) => {
    const decoded = jwt.verify(userdata, "key_for_accesst") as {
      id: string;
    };
    let userId = decoded.id;
    console.log("USER DISCONNECTED");
    socket.leave(userId);
  });
});
