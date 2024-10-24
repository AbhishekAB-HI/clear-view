import { useNavigate } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";
import { FaImage, FaSmile } from "react-icons/fa";
import { useParams } from "react-router-dom";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import { useSelector } from "react-redux";
import { store } from "../../Redux-store/Reduxstore";
import axios from "axios";
import data from "@emoji-mart/data";
import io, { Socket } from "socket.io-client";
import Picker from "@emoji-mart/react";
import ThreeDot from "react-loading";
import { IoSend } from "react-icons/io5";
import toast from "react-hot-toast";
import { OrbitProgress } from "react-loading-indicators";
import Swal from "sweetalert2";
import Navbar2 from "./Navbar2";
import SideBar2 from "./Sidebar2";
import {
  API_MESSAGE_URL,
  CONTENT_TYPE_JSON,
  CONTENT_TYPE_MULTER,
} from "../Constants/Constants";
import { userInfo } from "../Interfaces/Interface";

const ENDPOINT = "http://localhost:3000";
let socket: Socket;
let selectedChatCompare: any;

const ChatPage = () => {
 
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const { chatId, dataId } = useParams<{ chatId: any; dataId: any }>();
  const [socketConnected, setSocketConnected] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postVideos, setPostVideos] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userinfo, setuserinfo] = useState<userInfo | null>(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [menuOpenPost, setMenuOpenPost] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | any>(null);
  const [userStatus, setuserStatus] = useState(false);

  useEffect(() => {
    const GetUserId = async () => {
      try {        
        const { data } = await axios.get(
          `${API_MESSAGE_URL}/getuserimage/${chatId}`
        );
        if (data.message === "Get user id") {
          setuserinfo(data.userinfo);
        } else {
          toast.error("User id not found");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (!error.response) {
            toast.error(
              "Network error. Please check your internet connection."
            );
          } else {
            const status = error.response.status;
            if (status === 404) {
              toast.error("Posts not found.");
            } else if (status === 500) {
              toast.error("Server error. Please try again later.");
            } else {
              toast.error("Something went wrong.");
            }
          }
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
        console.log("Error fetching posts:", error);
      }
    };

    GetUserId();
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoinRoom = useCallback(() => {
    navigate(`/room/${dataId}`);
  }, [navigate, dataId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      toast.success("file uploaded");
      const imageFiles: File[] = [];
      const videoFiles: File[] = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        } else if (file.type.startsWith("video/")) {
          videoFiles.push(file);
        }
      });

      if (imageFiles.length > 0) {
        setPostImages((prevImages) => [...prevImages, ...imageFiles]);
      }

      if (videoFiles.length > 0) {
        setPostVideos((prevVideos) => [...prevVideos, ...videoFiles]);
      }

      
    }

     
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prevContent) => prevContent + emoji.native);
    setShowEmojiPicker(false);
  };

  type RootState = ReturnType<typeof store.getState>;
  const selectedChat = useSelector(
    (state: RootState) => state.accessTocken.SelectedChat
  );
  const userToken = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const { data } = await ClientNew.get(`${API_MESSAGE_URL}/${dataId}`, {
        headers: {
          "Content-Type": CONTENT_TYPE_JSON,
        },
      });
      if (data.message === "Get all messages") {
        setMessages(data.Allmessage);
        socket.emit("join chat", dataId);
      } else {
        toast.error("Failed to get all messages");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error("Network error. Please check your internet connection.");
        } else {
          const status = error.response.status;
          if (status === 404) {
            toast.error("Posts not found.");
          } else if (status === 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error("Something went wrong.");
          }
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.log("Error fetching posts:", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    socket.emit("stop typing", dataId);

    if (
      !newMessage.trim() &&
      postImages.length === 0 &&
      postVideos.length === 0
    ) {
      return;
    }

    try {
      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append("content", newMessage);
      }
      formData.append("chatId", dataId);
      postImages.forEach((image, index) => {
        formData.append(`images`, image);
      });
      postVideos.forEach((video, index) => {
        formData.append(`videos`, video);
      });

      const { data } = await ClientNew.post(`${API_MESSAGE_URL}`, formData, {
        headers: {
          "Content-Type": CONTENT_TYPE_MULTER,
        },
      });

      if (data) {
        setLoading(false);
      
        socket.emit("new message", data);
        setMessages([...messages, data]);
        setNewMessage("");
        setPostImages([]);
        setPostVideos([]);
        scrollToBottom();
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error("Network error. Please check your internet connection.");
        } else {
          const status = error.response.status;
          if (status === 404) {
            toast.error("Posts not found.");
          } else if (status === 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error("Something went wrong.");
          }
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.log("Error fetching posts:", error);
    }
  };

  const handleBlockUser = async (
    userId: string,
    LogedUserId: string,
    isActive: boolean
  ) => {
    try {
      const actionText = isActive ? "Block user" : "Unblock user";
      const confirmationText = isActive
        ? "Are you sure you want to block this user?"
        : "Are you sure you want to unblock this user? ";

      Swal.fire({
        title: confirmationText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: actionText,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { data } = await ClientNew.patch(
            `${API_MESSAGE_URL}/blockuser`,
            { userId, LogedUserId },
            {
              headers: {
                "Content-Type": CONTENT_TYPE_JSON,
              },
            }
          );

          if (data.message == "User blocked") {
            setuserStatus(data.userStatus);
          } else {
            toast.error("User blocked Failed");
          }
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          toast.error("Network error. Please check your internet connection.");
        } else {
          const status = error.response.status;
          if (status === 404) {
            toast.error("Posts not found.");
          } else if (status === 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error("Something went wrong.");
          }
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.log("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", userToken);
    socket.on("connection", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    scrollToBottom();
  }, [selectedChat]);

  useEffect(() => {
    const getUserToken = async () => {
      if (!userToken) return;
      try {
        const { data } = await axios.get(
          `${API_MESSAGE_URL}/getuserId/${userToken}`
        );
        if (data.message === "User id found") {
          setUserId(data.userId);
        } else {
          toast.error("No id get here");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (!error.response) {
            toast.error(
              "Network error. Please check your internet connection."
            );
          } else {
            const status = error.response.status;
            if (status === 404) {
              toast.error("Posts not found.");
            } else if (status === 500) {
              toast.error("Server error. Please try again later.");
            } else {
              toast.error("Something went wrong.");
            }
          }
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
        console.log("Error fetching posts:", error);
      }
    };
    getUserToken();
  }, [userToken]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived: any) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        setMessages([...messages, newMessageReceived]);
        scrollToBottom();
      } else {
      }
    });
  }, [messages, selectedChatCompare]);

  const handleMenuClick = (userId: string) => {
    setMenuOpenPost(menuOpenPost === userId ? null : userId);
  };

  const typingHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", dataId);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", dataId);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <div className="flex mt-20">
        <SideBar2 />
        <main className="w-full lg:w-4/5 ml-auto p-4 flex flex-col space-y-4 relative h-screen">
          <div className="top-30 fixed w-full lg:w-4/5 rounded-xl bg-gray-900 p-4 flex items-center justify-between z-50">
            <div className="flex items-center space-x-4">
              <label
                htmlFor="profile-image-upload"
                className="cursor-pointer bg-gray-700 p-2 rounded-full"
              >
                <img
                  src={
                    userinfo?.image ||
                    "https://dummyimage.com/150x150/cccccc/ffffff&text=Uploadimage"
                  }
                  alt="profile-upload"
                  className="rounded-full w-10 h-10"
                />
              </label>
              <h1 className="text-lg lg:text-2xl font-bold">
                {userinfo?.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4 lg:space-x-10 mr-2 lg:mr-20">
              <button
                onClick={handleJoinRoom}
                className="bg-red-600 p-2 lg:p-3 rounded-full text-white hover:bg-red-500 transition text-sm lg:text-base"
              >
                📹 Video
              </button>
              {menuOpenPost === userinfo?._id && (
                <div
                  className="absolute right-2 lg:right-20 mt-12 lg:mt-20 w-40 rounded-md shadow-lg bg-gray-800 text-white ring-1 ring-black ring-opacity-5"
                  onMouseLeave={() => setMenuOpenPost(null)}
                >
                  <button
                    onClick={() =>
                      handleBlockUser(userinfo._id, userId, userStatus)
                    }
                    className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                  >
                    {userStatus ? "Block User" : "UnBlock User"}
                  </button>
                  <button className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left">
                    Report User
                  </button>
                </div>
              )}
              <button onClick={() => handleMenuClick(userinfo?._id)}>
                <FaInfoCircle size="24px" className="text-white" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-black border rounded-lg h-full w-full lg:w-[155vh] overflow-y-auto mt-20 lg:mt-24">
            <div className="mt-20 mb-24 px-4 space-y-6">
              {messages.map((m) => (
                <div
                  className={`flex items-start space-x-2 ${
                    m.sender._id === userId ? "justify-end" : "justify-start"
                  }`}
                  key={m._id}
                >
                  {m.sender._id !== userId && (
                    <img
                      className="rounded-full w-8 h-8 lg:w-12 lg:h-12"
                      src={
                        m.sender.image
                          ? m.sender.image
                          : "https://dummyimage.com/150x150/cccccc/ffffff&text=Uploadimage"
                      }
                      alt="profile"
                    />
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md rounded-lg p-2 mt-5 ${
                      m.sender._id === userId
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-700 text-white shadow-md"
                    }`}
                  >
                    <p className="text-sm  lg:text-lg font-semibold">
                      {m.content}
                    </p>
                    {(m.image || m.videos) && (
                      <div className="mt-2">
                        {m.image && m.image.length > 0 ? (
                          <img
                            className="rounded-md w-32 h-32 lg:w-40 lg:h-40 object-cover"
                            src={
                              m.image ||
                              "https://dummyimage.com/150x150/cccccc/ffffff&text=Uploadimage"
                            }
                            alt="sendimage"
                          />
                        ) : (
                          m.videos &&
                          m.videos.length > 0 && (
                            <video controls className="w-full mt-2 rounded-md">
                              <source src={m.videos} type="video/mp4" />
                            </video>
                          )
                        )}
                      </div>
                    )}
                    <p className="text-xs lg:text-sm text-gray-400 mt-2">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {istyping && <ThreeDot />}
              {loading && (
                <OrbitProgress
                  color="#32cd32"
                  size="medium"
                  text=""
                  textColor=""
                />
              )}
            </div>
          </div>

          {/* Message Input Form */}
          <div className="bottom-0 fixed w-4/5 lg:w-4/5 rounded-xl bg-gray-900 p-4 flex items-center justify-between z-50">
            <form
              onSubmit={handleSubmit}
              className="flex items-center w-full space-x-2 lg:space-x-4"
            >
              <FaSmile
                className="text-3xl lg:text-4xl hover:text-blue-500 cursor-pointer"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              <input
                type="text"
                value={newMessage}
                onChange={typingHandler}
                className="p-2 flex-grow-0 w-full lg:w-3/4 rounded-md bg-gray-800 border border-gray-700 text-white text-sm lg:text-base"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="text-blue-500 w-10 h-10 lg:w-12 lg:h-12 hover:text-green-500 transition flex items-center justify-center"
              >
                <IoSend className="hover:text-green-500 text-xl lg:text-3xl" />
              </button>

              {/* Image Upload Label and Input */}
              <label
                htmlFor="upload-files"
                className="cursor-pointer w-10 h-10 lg:w-12 lg:h- mt-3 ml-2 lg:ml-10"
              >
                <FaImage className="text-xl lg:text-3xl hover:text-blue-500 transition" />
              </label>
              <input
                type="file"
                id="upload-files"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </form>

            {showEmojiPicker && (
              <div className="absolute bottom-16 left-0">
                <Picker data={data} onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
