import toast from "react-hot-toast";
import {  useEffect, useState } from "react";
import Navbar2 from "../UserSide/Navbar2";
import axios from "axios";
import { IUser } from "../Interfaces/Interface";
import SideNavBar from "./SideNavbar";
import { useNavigate } from "react-router-dom";
import { sendfollow } from "../UserSide/GlobalSocket/CreateSocket";
import { Users2Icon } from "lucide-react";
import { findfollowing, followuser, getuserinfomations } from "../../Services/User_API/FollowerApi";

const FollowingPage = () => {
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [userid, setuserID] = useState<string>("");
  const [userinfo, setuserinfo] = useState<IUser>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerPage] = useState(1);

  useEffect(() => {
    const getAllPost = async () => {
      try {
         const responce = await findfollowing(currentPage, postsPerPage);

        if (responce.success) {
          setgetAlluser(responce.followusers);
          setTotalPosts(responce.totalfollow);
        } else {
          toast.error("Failed to get other users");
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

    getAllPost();
  }, []);


  useEffect(() => {
    updateUsers();
  }, [currentPage]);

  const updateUsers = async () => {
    try {
   const responce = await findfollowing(currentPage, postsPerPage);
      if (responce.success) {
        setgetAlluser(responce.followusers);
        setTotalPosts(responce.totalfollow);
      } else {
        toast.error("Failed to get other users");
      }
    } catch (error: unknown) {
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
    const findUsers = async () => {
      try {
          const response = await getuserinfomations();
        if (response.success) {
          setuserID(response.useridfound);
        } else {
          toast.error("user id not found");
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
    findUsers();
  }, []);

  const viewProfile = async (userID: string) => {
    try {
      if (userID === userid) {
        navigate("/profile");
      } else {
        navigate("/viewProfile", { state: { userID } });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserinfo = async () => {
    try {
       const response = await getuserinfomations();
      if (response.success) {
        setuserinfo(response.userdetails);
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

  const followUser = async (userId: string, LoguserId: string) => {
    try {

      const response = await followuser(userId, LoguserId);
      if (response.success) {
        sendfollow(userId, response.usersinfos, response.followingUsers);
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

  useEffect(() => {
    const getUserinfo = async () => {
      try {
     const response = await getuserinfomations();
        if (response.success) {
          setuserinfo(response.userdetails);
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

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <SideNavBar />
      <div className="flex mt-12">
        {/* Sidebar */}

        {/* Main Content */}
        <main className="w-4/5 ml-auto ">
          {/* Messages Section */}
          <div className="fixed  bg-black w-full pl-5     pt-5  pb-5">
            <h1
              style={{ fontSize: "25px" }}
              className=" flex text-xl font-bold ml-0"
            >
              Following
            </h1>
          </div>

          <div className="space-y-4 p-5 mt-20  w-full h-[100vh]">
            <div className="space-y-4 w-full h-[100vh] ">
              {getAlluser && getAlluser.length > 0 ? (
                getAlluser.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between bg-gray-900 p-4 rounded-lg hover:shadow-lg transition-shadow"
                  >
                    {/* User Profile and Info */}
                    <div
                      onClick={() => viewProfile(user._id)}
                      className="flex items-center space-x-5 w-full cursor-pointer"
                    >
                      <img
                        src={user.image}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border border-gray-700"
                      />
                      <div>
                        <p className="text-lg font-medium text-white">
                          {user.name}
                        </p>
                      </div>
                    </div>

                    {/* Follow/Unfollow Button */}
                    <div>
                      <button
                        onClick={() => followUser(user._id, userinfo?._id)}
                        className={`mr-10 px-4 py-2 text-sm font-semibold rounded-full border transition-colors duration-300 ${
                          userinfo?.following.some(
                            (userOne) => userOne._id === user._id
                          )
                            ? "text-white border-blue-600 bg-transparent hover:bg-blue-700 hover:border-blue-700"
                            : "text-white border-blue-600 bg-blue-600 hover:bg-blue-700 hover:border-blue-700"
                        }`}
                      >
                        {userinfo?.following.some(
                          (userOne) => userOne._id === user._id
                        )
                          ? "Following"
                          : "Follow"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // No Followers Placeholder
                <div className=" flex flex-col items-center justify-center h-[500px] p-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-sm animate-pulse" />
                      <Users2Icon
                        size={48}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      No Following
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                      Looks like there aren't any Following. Check back later.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex mb-20 justify-center mt-0">
            <nav className="flex space-x-2">
              <button
                className={`text-lg text-blue-500 ${
                  currentPage === 1 && "opacity-50 cursor-not-allowed"
                }`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                {"<"}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`text-sm ${
                      page === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-blue-500"
                    } px-3 py-1 rounded-md`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className={`text-sm text-blue-500 ${
                  currentPage === totalPages && "opacity-50 cursor-not-allowed"
                }`}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                {">"}
              </button>
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FollowingPage;
