import { useState } from "react";
import { useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
import { store } from "../../../Redux-store/Reduxstore";
import { ActiveUsersType } from "../../Interfaces/Interface";

const ENDPOINT = "http://localhost:3000";
let socket: Socket | undefined; // Define socket as optional
let selectedChatCompare: any;

type RootState = ReturnType<typeof store.getState>;

export const initilizeSocket = (userToc: string): Socket => {
  socket = io(ENDPOINT);
  socket.emit("setup", userToc);

  return socket;
};

export const joinChatRoom = (chatId: string) => {
  console.log("2222222222222222222222222",socket)
  if (socket) socket.emit("join chat", chatId);
};

export const sendMessage = (message: any) => {
  if (socket) socket.emit("new message", message);
};

export const handleTyping = (chatId: string) => {
  if (socket) socket.emit("typing", chatId);
};

export const stopTyping = (chatId: string) => {
  if (socket) socket.emit("stop typing", chatId);
};

export const ActiveUsershere = (setActiveUsers: React.Dispatch<React.SetStateAction<ActiveUsersType[]>>
) => {
  if (socket) {
    socket.on("get-users", (users: ActiveUsersType[]) => {
      setActiveUsers(users);
    });
  }
};


 export const logoutUser = (userId: string) => {
  console.log("1111111111111111111111111111111",socket)
  if(socket)socket.emit("logout", userId);
 };



export const setupOnMessageReceived = (callback: (message: any) => void) => {
  if (!socket) {
    console.error("Socket is not initialized. Call initilizeSocket first.");
    return;
  }
  socket.on("message received", callback);
};


