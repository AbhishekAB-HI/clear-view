import express from "express";
import cors from "cors";
import userRouter from "./Routes/Userroutes";
import connectDB from "./Config/Db";
import adminRouter from "./Routes/Adminrouter";
import passportauth from "./Googleauth/Passport";
import session from "express-session";
import googleauthRoutes from "./Routes/Googleroute";
import chatRoutes from "./Routes/Chatroute";
import messageRoute from "./Routes/Messageroute";
import jwt from "jsonwebtoken";
import '../src/Notifications/Notifications'
import logger from "./logger";
import morgan from "morgan";
import { Socket } from "socket.io";

const morganFormat = ":method :url :status :response-time ms";

const app = express();

connectDB();

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message:string) => {
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
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket: Socket) => {
  console.log("connection to socket.io");
  socket.on("setup", (userdata: string) => {
    const decoded = jwt.verify(userdata, "key_for_accesst") as {
      id: string;
    };
    let userId = decoded.id;

    socket.join(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room: string) => {
    socket.join(room);
    console.log("User joined Room : " + room);
  });

  socket.on("typing", (room: string) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room: string) =>
    socket.in(room).emit("stop typing")
  );

  interface NewMessage {
    chat: {
      users: string[];
    };
    sender: {
      _id: string;
    };
  }


  socket.on("new message", (newMessageReceived: NewMessage) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      return console.log("chat.user not defined");
    }
    chat.users.forEach((user: string) => {
      if (user === newMessageReceived.sender._id) return;
      socket.in(user).emit("message received", newMessageReceived);
    });
  });
  socket.off("setup", (userdata: string) => {
    const decoded = jwt.verify(userdata, "key_for_accesst") as {
      id: string;
    };
    let userId = decoded.id;
    console.log("USER DISCONNECTED");
    socket.leave(userId);
  });
});
