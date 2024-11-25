import toast from "react-hot-toast";
import { FormEvent, useEffect, useState } from "react";
import { store } from "../../Redux-store/Reduxstore";
import Navbar2 from "./Navbar2";
import {
  API_CHAT_URL,
  API_USER_URL,
} from "../Constants/Constants";
import axios from "axios";
import { IAllNotification, IPost, IUser } from "../Interfaces/Interface";
import SideNavBar from "./SideNavbar";
import { Bell, MoreHorizontal, Users2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../Services/Axiosinterseptor";

const NotificationPage = () => {
  const [Loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [notifications, setnotifications] = useState<IAllNotification[]>([]);
  const [likenotifications, setlikenotifications] = useState<
    IAllNotification[]
  >([]);
  const [AllPosts, setAllPosts] = useState<IPost[]>([]);
  const [userID, setuserID] = useState<string>("");
  const [userFound, setuserFound] = useState(false);
  const [userinfo, setuserinfo] = useState<IUser | null>(null);
  const [useruserprofile, setuserprofile] = useState<IUser | null>(null);
  const navigate = useNavigate();

  type RootState = ReturnType<typeof store.getState>;

  useEffect(() => {
    const updateUsers = async () => {
      try {
        const { data } = await axiosClient.get(
          `${API_CHAT_URL}/findnotifications`
        );
        if (data.message === "Allnotifications get") {
    
          setnotifications(data.followNotifications);
          setAllPosts(data.postNotifications);
          setlikenotifications(data.likeNotifications);
        } else {
          toast.error("Notifications not found");
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
    updateUsers();
  }, []);

  const updateUsers = async () => {
    try {
      const { data } = await axiosClient.get(
        `${API_CHAT_URL}/findnotifications`
      );
      if (data.message === "Allnotifications get") {
        setnotifications(data.Follownotifications);
        setAllPosts(data.findAllposts);
      } else {
        toast.error("followers not found");
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

  useEffect(() => {
    const getUserinfo = async () => {
      try {
        const { data } = await axiosClient.get(`${API_USER_URL}/getUserinfo`);
        if (data.message === "get User data") {
          setuserinfo(data.userDetails);
        } else {
          toast.error("No user found");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data?.message || "An error occurred";
          toast.error(errorMessage);
        } else {
          toast.error("Unknown error occurred");
        }
        console.error("Error verifying OTP:", error);
      }
    };
    getUserinfo();
  }, []);

  const getUserinfo = async () => {
    try {
      const { data } = await axiosClient.get(`${API_USER_URL}/getUserinfo`);
      if (data.message === "get User data") {
        setuserinfo(data.userDetails);
      } else {
        toast.error("No user found");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      } else {
        toast.error("Unknown error occurred");
      }
      console.error("Error verifying OTP:", error);
    }
  };

  const ViewProfilePage = async (userID: string) => {
    try {
      navigate("/viewProfile", { state: { userID } });
    } catch (error) {
      console.log(error);
    }
  };

  const followUser = async (userId: string, LoguserId: string) => {
    try {
      const { data } = await axiosClient.post(`${API_CHAT_URL}/followuser`, {
        userId,
        LoguserId,
      });
      if (data.message === "followed users") {
        getUserinfo();
        updateUsers();
      } else {
        toast.error("followers found failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      } else {
        toast.error("Unknown error occurred");
      }
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <SideNavBar />
      <div className="flex mt-12 ">
        <main className="w-4/5 ml-auto ">
          <div className="max-w-full mt-10 mx-auto bg-white dark:bg-black rounded-xl shadow-lg">
            <div className="divide-y divide-gray-200 border rounded-md border-radious border-gray-500 dark:divide-gray-800">
              {/* Notifications Section */}

              <h2 className="text-xl p-5 font-bold dark:text-white">
                Notifications
              </h2>

              {(notifications && notifications.length > 0) || (likenotifications && likenotifications.length > 0)  ||  (AllPosts && AllPosts.length > 0) ? (
                <>
                  {/* Notifications */}
                  {notifications && notifications.length > 0 && (
                    <>
                      {notifications.map((user, index) => (
                        <div
                          onClick={() => ViewProfilePage(user.followuserId)}
                          key={index}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold dark:text-white">
                                  {user.userName}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  started following you
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* New Posts */}
                  {likenotifications && likenotifications.length > 0 && (
                    <>
                      {likenotifications.map((post) => (
                        <div
                          key={post._id}
                          onClick={() => ViewProfilePage(post.likeduserId)}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            {post.postimage && post.postimage.length > 0 && (
                              <div className="relative w-12 h-12">
                                <img
                                  src={post.postimage[0]}
                                  alt="Post"
                                  className="w-full h-full rounded object-cover"
                                />
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="blue"
                                  stroke="blue"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full p-1 transform translate-x-1/2 translate-y-1/2"
                                >
                                  <path d="M12 21C12 21 7 16.5 5 12.5C3 8.5 5.5 4.5 8 4.5C10.5 4.5 12 6.5 12 6.5C12 6.5 13.5 4.5 16 4.5C18.5 4.5 21 8.5 19 12.5C17 16.5 12 21 12 21Z" />
                                </svg>
                              </div>
                            )}

                            <div className="flex flex-col">
                               <span className="text-md text-gray-500 dark:text-gray-400">
                                {post.postcontent}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Liked by {post.likedusername}
                              </span>
                             
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {AllPosts && AllPosts.length > 0 && (
                    <>
                      {AllPosts.map((post) => (
                        <div
                          key={post._id}
                          onClick={() => ViewProfilePage(post.followuserId)}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            {post.image && post.image.length > 0 ? (
                              <>
                                <img
                                  src={post.image[0]}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  A new post uploaded
                                </span>
                              </>
                            )}

                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Posted by {post.postUsername}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                // No Notifications or Posts
                <div className="relative mb-10 h-[500px] flex flex-col items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-sm animate-pulse" />
                      <Users2Icon
                        size={48}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      No Notifications or Posts
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                      Looks like there aren't any notifications or posts yet.
                      Check back later.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationPage;
