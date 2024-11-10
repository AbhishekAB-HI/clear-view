import { ChangeEvent, useEffect, useState } from "react";
import { store } from "../../Redux-store/Reduxstore";
import Lottie from "lottie-react";
import logoWeb from "../animations/Animation - 1724244656671.json";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearuserAccessTocken } from "../../Redux-store/Redux-slice";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { IPost, Notification } from "../Interfaces/Interface";
import { API_CHAT_URL, API_USER_URL, CONTENT_TYPE_JSON } from "../Constants/Constants";
import toast from "react-hot-toast";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import { setChats, setSelectedChat } from "../../Redux-store/Redux-slice";
const Navbar2 = () => {
  type RootState = ReturnType<typeof store.getState>;
  const userDetails = useSelector((state: RootState) => state.accessTocken.userTocken);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPost, setFilteredPost] = useState<IPost[]>([]);
  const [Userpost, setPostList] = useState<IPost[]>([]);
  const [SaveAllNotifications, setSaveAllNotifications] = useState<Notification[]>([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [AccOpen, setAccOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [Notificationview, setNotificationview] = useState(false);
   const getchat = useSelector((state: RootState) => state.accessTocken.chats);
  useEffect(() => {
    const getNotifications = async () => {
      try {
        const { data } = await ClientNew.get(
          `${API_CHAT_URL}/getnotifications`
        );
        if (data.message === "get all notifications") {
          setSaveAllNotifications(data.notifications);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getNotifications();
  }, []);

  useEffect(() => {
    const getAllpost = async () => {
      try {
        const { data } = await axios.get(`${API_USER_URL}/getAllpost`);
        if (data.message === "getAllpostdetails") {
          setPostList(data.getAlldetails);
          setFilteredPost(data.getAlldetails);
        } else {
          toast.error("getting post fail");
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

    getAllpost();
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(clearuserAccessTocken());
      localStorage.removeItem("usertocken");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };




   const movetomessagepage = async (chatId: String) => {
     try {
       const { data } = await ClientNew.post(
         `${API_CHAT_URL}`,
         { chatId },
         {
           headers: {
             "Content-type": CONTENT_TYPE_JSON,
           },
         }
       );

       if (data.message === "Chat created succesfully") {
         if (!getchat.find((c) => c._id === data.fullChat._id))
           dispatch(setChats([data.fullChat, ...getchat]));
         dispatch(setSelectedChat(data.fullChat));
         navigate(`/chatpage/${chatId}/${data.fullChat._id}`);
       } else {
         toast.error("Chat created  Failed");
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

  return (
    <nav className="fixed w-full top-0 left-0 z-50 bg-black border-b border-gray-700">
      <div className="px-4 py-3 pb-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Lottie animationData={logoWeb} className="w-12 sm:w-16 md:w-20" />
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "Viaoda Libre" }}
            >
              Clear View
            </h1>
          </div>

         

          {/* Account Dropdown */}
          <div className="flex items-center space-x-4 md:space-x-6 lg:mr-10 text-white text-base md:text-lg">
            <div className="relative inline-block">
              {/* Bell Icon */}
              <FaBell
                onClick={() => setNotificationview(!Notificationview)}
                className="text-[20px] hover:text-[22px] hover:cursor-pointer"
              />
              {/* Notification Count */}
              {SaveAllNotifications && SaveAllNotifications.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {SaveAllNotifications.length}
                </span>
              )}
            </div>
            {/* Notification Modal */}

            {Notificationview && (
              <div className="absolute right-60 mt-80 w-80 bg-white shadow-lg rounded-lg z-10">
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-700 mb-2">
                    Notifications
                  </h2>
                  {SaveAllNotifications.length > 0 ? (
                    SaveAllNotifications.map((notification) => (
                      <div
                        onClick={() =>
                          movetomessagepage(notification.sender._id)
                        }
                        key={notification.id}
                        className="p-2 border-b hover:cursor-pointer border-gray-300"
                      >
                        <small className="text-sm text-red-600 font-medium p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-300 ease-in-out">
                          You have a message from {notification.sender.name}
                        </small>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No new notifications</p>
                  )}
                </div>
              </div>
            )}
            {userDetails ? (
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setAccOpen(!AccOpen)}
                  className="bg-gray-50 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white hidden lg:block"
                >
                  Account
                </button>
                {AccOpen && (
                  <div
                    className="absolute lg:right-20 lg:top-0 w-32 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5" // Adjusted width and margin
                    onMouseLeave={() => setIsOpen(false)}
                  >
                    <div className="py-1">
                      <Link
                        className="block px-4 py-1 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                        to="/profile"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-1 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <button className="hover:underline">
                  <Link to="/login">Log In</Link>
                </button>
                <span>|</span>
                <button className="hover:underline">
                  <Link to="/register">Sign Up</Link>
                </button>
              </div>
            )}
          </div>

          {/* Mobile search bar and account toggle */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setShowMobileSearch(!showMobileSearch)}>
              <AiOutlineSearch size="24px" className="text-white" />
            </button>
            <button
              className="ml-4 text-white"
              onClick={() => setAccOpen(!AccOpen)}
            >
              <FaUserCircle size="24px" />
            </button>
          </div>
        </div>
      </div>

      
    </nav>
  );
};

export default Navbar2;
