import express from 'express'
import cors from 'cors'
import userRouter from './Routes/userRoutes'  
import connectDB from './config/db'
import adminRouter from './Routes/adminRouter'
import  passportauth  from '../src/Googleauth/passport'
import session from "express-session";
import googleauthRoutes from "../src/Routes/googleRoute";
import chatRoutes from '../src/Routes/ChatRoute'
import messageRoute  from '../src/Routes/messageRoute'
import jwt from 'jsonwebtoken'

const app = express();

connectDB()   

const port = 3000

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
app.use(express.urlencoded({extended:true,limit:'200mb'})); 
app.use("/api/user", userRouter);
app.use("/", googleauthRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/chat",chatRoutes)
app.use("/api/message", messageRoute);

     
           
 const server =app.listen((port),()=>{ 
    console.log(`server is running at :- ${port}`);
});  

const io = require("socket.io")(server, {
  pingTimeout:60000,
  cors: {
    origin: "http://localhost:5173", 
  },
});

  io.on("connection",(socket:any)=>{
    console.log("connection to socket.io");
    socket.on('setup',(userdata:any)=>{
        const decoded = jwt.verify(userdata, "key_for_accesst") as {
          id: string;
        };
        let userId = decoded.id;
        
      socket.join(userId);
      socket.emit("connected")
    })

    socket.on("join chat", (room: any) => {
      socket.join(room);
      console.log("User joined Room : " + room);
    });

    socket.on("typing",(room:any)=>socket.in(room).emit("typing"));
    socket.on("stop typing", (room: any) => socket.in(room).emit("stop typing"));

    socket.on("new message",(newMessageReceived:any)=>{
         var chat = newMessageReceived.chat
         console.log(chat,'user datassssssssssssssssssssssssssssss3444444444444444444');
         
         if(!chat.users){
          return console.log('chat.user not defined');
         }
         chat.users.forEach((user:any) => {
          if(user===newMessageReceived.sender._id) return
          socket.in(user).emit("message received", newMessageReceived);
          
         });
    })
     socket.off("setup", (userdata: any) => {
       const decoded = jwt.verify(userdata, "key_for_accesst") as {
         id: string;
       };
       let userId = decoded.id;
       console.log("USER DISCONNECTED");
       socket.leave(userId);
     });



    
  })   









