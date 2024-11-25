import React, { useEffect, useState } from "react";
import {FaBars} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Home, MessageSquare, Users, Bell, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { store } from "../../Redux-store/Reduxstore";
import {
  API_CHAT_URL,
  API_USER_URL,
} from "../Constants/Constants";
import axios from "axios";
import toast from "react-hot-toast";
import { FormattedChat, IAllNotification, IPost, IUser } from "../Interfaces/Interface";
import io, { Socket } from "socket.io-client";
import axiosClient from "../../Services/Axiosinterseptor";
const ENDPOINT = "http://localhost:3000";
let socket: Socket;
let selectedChatCompare: any;
const SideNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveid, setsaveid] = useState<string | any>(null);
  type RootState = ReturnType<typeof store.getState>;
  const [filteredPost, setFilteredPost] = useState<IPost[]>([]);
  const [userPost, setuserPost] = useState<IPost[]>([]);
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [saveAllmessage, setsaveAllmessage] = useState<FormattedChat[]>([]);
  const [saveAllgroupmessage, setsaveAllgroupmessage] = useState<FormattedChat[]>([]);
  const [SaveAllNotifications, setSaveAllNotifications] = useState<
    Notification[]
  >([]);

  console.log(SaveAllNotifications,"101029999999999999999999999999999999999999999999999992222222222222222222");
  const userDetails = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );

  const selectedChat = useSelector(
    (state: RootState) => state.accessTocken.SelectedChat
  );
  const [showpostModal, setShowpostModal] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    if (userDetails) {
      socket.emit("setup", userDetails);
    }
    return () => {
      socket.disconnect();
    };
  }, [userDetails]);

  const getNotifications = async () => {
    try {
      const { data } = await axiosClient.get(
        `${API_CHAT_URL}/getnotifications`
      );
      if (data.message === "get all notifications") {
        setSaveAllNotifications(data.notifications);
      }else{
        toast.error("No notifications");
      }
    } catch (error) {
      console.log(error);
    }
  };


  

  const getAllPost = async () => {
    try {
      const { data } = await axiosClient.get(`${API_CHAT_URL}/allmessages`);
      if (data.message === "other message get here") {
        setgetAlluser(data.foundUsers);
        setsaveAllmessage(data.formattedChats);
        setsaveAllgroupmessage(data.formatgroupchats);
      } else {
        toast.error("other message is not get here");
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

  const [notifications, setNotifications] = useState<IUser[]>([]);
  const [Savenewpost, setSavenewpost] = useState<IAllNotification[]>([]);
  const [savelikeNotify, setsavelikeNotify] = useState<IAllNotification>();
  const getFollownotification = async (userId: string,followuserId:string,followValue: boolean) => {
    try {
      const { data } = await axiosClient.get(`${API_CHAT_URL}/getfollownotify?id=${userId}&&followvalue=${followValue}&&followid=${followuserId}` );
      if (data.message === "get all notifications") {
        setNotifications(data.follownotifications);
      } else {
        toast.error("User data not saved");
      }
    } catch (error) {
      console.log(error);
    }
  };

    

  useEffect(() => {
    socket.on("notification received", (newMessageReceived: any) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        getNotifications();
      } else {
      }
    });
  }, []);
 

  useEffect(() => {
    socket.on("follow received",(logeduserinfo, followingUser, followuserId) => {
         toast.success("User follow you");
        setSavenewpost(followingUser);
      }
    );

    socket.on("Likenotification",(postDetails)=>{
     toast.success("User Liked your post");
      setsavelikeNotify(postDetails);
    });

  
    socket.on("post update", (postedUserInfo, postdetails) => {
      toast.success("new post uploaded");
      setSavenewpost(postdetails);
    });
  }, []);






  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data } = await axiosClient.get(`${API_USER_URL}/getuserid`);
        if (data.message === "user id get") {
          setsaveid(data.userId);
        } else {
          toast.error("Failed to retrieve userid.");
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

    getUserId();
  }, [userDetails]);

  const groupedNotifications = Array.isArray(SaveAllNotifications)
    ? SaveAllNotifications.reduce((acc, notification) => {
        const senderId = notification.sender._id;
        if (!acc[senderId]) {
          acc[senderId] = { ...notification, count: 1 };
        } else {
          acc[senderId].count += 1;
        }
        return acc;
      }, {})
    : {};

  const groupedNotificationsArray = Object.values(groupedNotifications);

  const togglepostModal = () => {
    setShowpostModal(!showpostModal);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar after a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="md:hidden fixed  top-10  left-0 z-50 text-2xl text-white focus:outline-none"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-20 left-0 pt-10 h-full bg-black  border-r border-t border-gray-700 text-gray-100 w-10 p-6 space-y-6 
        shadow-xl transition-all duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 sm:w-1/6    md:w-1/5 md:left-0`}
      >
        {/* Navigation Links */}
        <nav className="space-y-2">
          {[
            { icon: <Home size={24} />, text: "Home", path: "/homepage" },
            {
              icon: <MessageSquare size={24} />,
              text: "Messages",
              path: "/message",
              notificationCount:
                SaveAllNotifications?.length ||
                groupedNotificationsArray?.length ||
                0,
            },
            {
              icon: <Users size={24} />,
              text: "Followers",
              path: "/followers",
            },
            {
              icon: <Users size={24} />,
              text: "Following",
              path: "/following",
            },
            {
              icon: <Bell size={24} />,
              text: "Notifications",
              path: "/notifications",
              followNotification:
                notifications.length !== 0 ||
                Savenewpost.length !== 0 ||
                savelikeNotify !== undefined,
            },
            {
              icon: <Users size={24} />,
              text: "Find Friends",
              path: "/people",
            },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg
              hover:bg-gray-800 transition-all duration-200
              group relative overflow-hidden"
            >
              <div
                className="text-gray-400 group-hover:text-blue-500 
              transition-colors duration-200"
              >
                {item.icon}
              </div>
              <span
                className="text-gray-300 group-hover:text-white
              transition-colors duration-200 text-sm font-medium"
              >
                {item.text}
              </span>
              {item.text === "Messages" && item.notificationCount > 0 && (
                <span className="absolute top-0 left-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {item.notificationCount}
                </span>
              )}
              {item.text === "Notifications" && item.followNotification > 0 && (
                <span className="absolute top-0 left-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  1
                </span>
              )}
              <div
                className="absolute inset-y-0 left-0 w-1 bg-blue-600 
              transform -translate-x-full group-hover:translate-x-0
              transition-transform duration-200"
              />
            </Link>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default SideNavBar;
