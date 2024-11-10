import io from "socket.io-client";

let socket: any;
const ENDPOINT = "http://localhost:3000";
socket = io(ENDPOINT);

export const onNotificationReceived = (
  callback: (notification: {
    _id: string;
    message: string;
    chatId: string;
    senderId: string;
    messageText: string;
  }) => void
) => {
  socket.on("new notification", (notification: Notification) => {
    callback(notification);
  });
};
