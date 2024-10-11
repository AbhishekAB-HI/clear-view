import { Link, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaEnvelope,
  FaHome,
  FaInfoCircle,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { FaImage, FaVideo, FaSmile } from "react-icons/fa";
import { MdMoreVert, MdOutlinePostAdd } from "react-icons/md";
import { Button } from "@mui/material";
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
import { store } from "../../Redux-store/reduxstore";
import axios from "axios";
import data from "@emoji-mart/data";
import io, { Socket } from "socket.io-client";
import Picker from "@emoji-mart/react";
import ThreeDot from "react-loading";
import { IoSend } from "react-icons/io5";
import toast from "react-hot-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { OrbitProgress } from "react-loading-indicators";
import Swal from "sweetalert2";

const ENDPOINT = "http://localhost:3000";
let socket: Socket;
let selectedChatCompare: any;

const ChatPage = () => {
  interface userInfo {
    image: string;
    name?: string;
    email?: string;
    _id?: any;
  }
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
  const [userStatus, setuserStatus] = useState(false)
  useEffect(() => {
    console.log(chatId, "user id");
    const Getuserimage = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/message/getuserimage/${chatId}`
        );
        setuserinfo(data);
      } catch (error) {
        console.log(error);
      }
    };
    Getuserimage();
  }, []);


      

  // useEffect(() => {
  //   const getUserId = async () => {
  //     try {
  //       console.log("Fetching user ID...");
  //       const { data } = await ClientNew.get(
  //         "http://localhost:3000/api/message/gettheUser",
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (data.message === "get UserId") {
  //         console.log(data.userId, "User ID fetched successfully");
  //         setUserId(data.userId);
  //       } else {
  //         console.error("Unexpected response:", data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user ID:", error);
  //     }
  //   };

  //   getUserId();
  // }, []); 

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
      const { data } = await ClientNew.get(
        `http://localhost:3000/api/message/${dataId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessages(data);
      socket.emit("join chat", dataId);
    } catch (error) {
      console.error(error);
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

      const { data } = await ClientNew.post(
        `http://localhost:3000/api/message`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data) {
        setLoading(false);
        toast.success("file upload successfull");
        socket.emit("new message", data);
        setMessages([...messages, data]);
        setNewMessage("");
        setPostImages([]);
        setPostVideos([]);
        scrollToBottom();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBlockUser = async (
    userId: string,
    LogedUserId: string,
    isActive:boolean
  ) => {
    console.log(userId, "userId");
    console.log(LogedUserId, "LogedUserId");

    try {
      const actionText = isActive ?  "Block user":"Unblock user" ;
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
      }).then(async(result)=>{
        if(result.isConfirmed){
          const { data } = await ClientNew.patch(
            "http://localhost:3000/api/message/blockuser",
            { userId, LogedUserId },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (data.message == "User blocked") {
            console.log(data.userStatus, "statues hereeeeeeeeeeeeeee");
            setuserStatus(data.userStatus);
          }
        }
      })
      
    } catch (error) {
      console.log(error);
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
          `http://localhost:3000/api/message/getuserId/${userToken}`
        );
        setUserId(data);

   
        
      } catch (error) {
        console.error(error);
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
  });

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
      <nav className="px-4 py-5 shadow-md fixed w-full top-0 left-0 z-50 bg-black">
        <div className="container mx-auto flex items-center justify-between">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "Viaoda Libre" }}
          >
            Clear View
          </h1>
          <form className="flex items-center space-x-2 mr-40">
            <input
              type="search"
              placeholder="Search"
              className="bg-gray-800 text-white px-4 py-2 mr-8 rounded-full outline-none"
            />
            <Button style={{ color: "white" }} variant="outlined">
              Search
            </Button>
          </form>
        </div>
      </nav>

      <div className="flex mt-20">
        <aside className="w-1/5 p-5 space-y-4 fixed left-20 h-screen overflow-y-auto">
          {/* Sidebar Navigation */}
          <div className="flex items-center space-x-2">
            <FaHome style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px", color: "white" }}>
              <Link to="/homepage">Home</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Message</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUserFriends style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Followers</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUsers style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Community</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaBell style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Notification</span>
          </div>
          <div className="flex items-center space-x-2">
            <MdOutlinePostAdd style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>
              <Link to="/createpost">Create Post</Link>
            </span>
          </div>
        </aside>

        {/* Main Chat Section */}
        <main className="w-4/5 ml-auto p-4 flex-col space-y-4 relative h-screen">
          <div className="top-20 fixed w-4/5 rounded-xl bg-gray-900 p-4 flex items-center justify-between z-50">
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
              <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
                {userinfo?.name}
              </h1>
            </div>
            <div className="flex items-center space-x-10 mr-20">
              <button
                onClick={handleJoinRoom}
                className="bg-red-600 p-3 rounded-full text-white hover:bg-red-500 transition"
              >
                📹 Video
              </button>
              {menuOpenPost === userinfo?._id && (
                <div
                  className="absolute right-20 mt-20 w-40 rounded-md shadow-lg bg-gray-800 text-white ring-1 ring-black ring-opacity-5"
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
                  <button
                    // onClick={() => handleReportUser(post._id)}
                    className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                  >
                    Report User
                  </button>
                  {/* Add more options here */}
                </div>
              )}
              <button onClick={() => handleMenuClick(userinfo?._id)}>
                {" "}
                <FaInfoCircle size="30px" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              border: "solid gray",
              borderRight: "1px",
            }}
            className="flex-1  bg-black rounded-lg h-[100vh] w-[155vh] overflow-y-auto"
          >
            <div className="mt-6 mb-24 px-4 space-y-6">
              {messages.map((m) => (
                <div
                  className={`flex items-start space-x-2 ${
                    m.sender._id === userId ? "justify-end" : "justify-start"
                  }`}
                  key={m._id}
                >
                  {m.sender._id !== userId && (
                    <img
                      className="rounded-full w-12 h-12"
                      src={
                        m.sender.image
                          ? m.sender.image
                          : "https://dummyimage.com/150x150/cccccc/ffffff&text=Uploadimage"
                      }
                      alt="profile"
                    />
                  )}
                  <div
                    className={`max-w-xs rounded-lg p-2 mt-5 ${
                      m.sender._id === userId
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-700 text-white shadow-md"
                    }`}
                  >
                    <p className="text-lg font-semibold">{m.content}</p>

                    {(m.image || m.videos) && (
                      <div className="mt-2">
                        {m.image && m.image.length > 0 ? (
                          <img
                            className="rounded-md w-40 h-40 object-cover"
                            src={
                              m.image
                                ? m.image
                                : "https://dummyimage.com/150x150/cccccc/ffffff&text=Uploadimage"
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
                    <p className="text-sm text-gray-400 mt-2">
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
          <div className="bottom-0 fixed w-4/5 rounded-xl bg-gray-900 p-4 flex items-center justify-between z-50">
            <form
              onSubmit={handleSubmit}
              className="flex items-center w-4/5 space-x-4"
            >
              <FaSmile
                className="text-4xl hover:text-blue-500 cursor-pointer"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              <input
                type="text"
                value={newMessage}
                onChange={typingHandler}
                className="p-2 flex-grow rounded-md bg-gray-800 border border-gray-700 text-white "
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="text-blue-500 hover:text-green-500 transition"
              >
                <IoSend className="hover:text-green-500" size="40px" />
              </button>

              {/* Image Upload Label and Input */}
              <label htmlFor="upload-files" className=" cursor-pointer ml-10">
                <FaImage className="text-4xl hover:text-blue-500 transition" />
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
