import React, { useEffect, useState } from "react";
import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaHome,
  FaUserFriends,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { BsUpload } from "react-icons/bs";
import { Home, MessageSquare, Users, Bell, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { store } from "../../Redux-store/Reduxstore";
import { API_USER_URL } from "../Constants/Constants";
import axios from "axios";
import toast from "react-hot-toast";
import Postpage from "./Addpost";
import { IPost } from "../Interfaces/Interface";
import ClientNew from "../../Redux-store/Axiosinterceptor";
const SideNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveid, setsaveid] = useState<string | any>(null);
  type RootState = ReturnType<typeof store.getState>;
  const [filteredPost, setFilteredPost] = useState<IPost[]>([]);
  const [userPost, setuserPost] = useState<IPost[]>([]);
  const userDetails = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );
  const [showpostModal, setShowpostModal] = useState(false);
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data } = await axios.get(
          `${API_USER_URL}/userdget/${userDetails}`
        );
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
        className="md:hidden fixed  top-20  left-0 z-50 text-2xl text-white focus:outline-none"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-20 left-0 pt-10 h-full bg-black  border-r border-t border-gray-700 text-gray-100 w-10 p-6 space-y-6 
        shadow-xl transition-all duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:w-72 md:left-0`}
      >
        {/* Navigation Links */}
        <nav className="space-y-2">
          {[
            { icon: <Home size={24} />, text: "Home", path: "/homepage" },
            {
              icon: <MessageSquare size={24} />,
              text: "Messages",
              path: "/message",
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
            },
            { icon: <Users size={24} />, text: "People", path: "/people" },
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
