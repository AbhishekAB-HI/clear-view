export interface NewMessage {
  chat: {
    users: string[];
  };
  sender: {
    _id: string;
  };
}
