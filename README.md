# mynews-app
# new-application
Clear View - Social Media Application - (Present)
Developed Clear View, a social media platform designed to connect and engage communities using the MERN
stack.
Designed the frontend using React, implemented the backend with TypeScript/Express.js, and utilized Mon-
goDB for database operations, all following the Repository Pattern.
Integrated JWT for secure authentication and real-time chat with Socket.IO.
Implemented video chat using Zego Cloud.














 socket.on(
    "following",
    (followuserId: string, logeduserinfo: IUser, followValue:boolean) => {
      logeduserinfo.following.map((user: any) => {
        if (user === followuserId) {
          console.log("777777777777777777777777777777777777777777777777")

        
          socket.in(user).emit("follow received", logeduserinfo, followValue);
        }
      });
    }
  );









