import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {  useEffect, useState } from "react";
import axios from "axios";
import Navbar2 from "../UserSide/Navbar2";
import {
  API_CHAT_URL,
} from "../Constants/Constants";
import { IUser } from "../Interfaces/Interface";
import SideNavBar from "../UserSide/SideNavbar";
import axiosClient from "../../Services/Axiosinterseptor";
import { sendfollow } from "../UserSide/GlobalSocket/CreateSocket";

const PeoplePage = () => {

  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [userinfos, setuserinfos] = useState<IUser>();
  const [useridget, setuserID] = useState<string>("");
  const [findAllUsers, setfindAllUsers] = useState<IUser[]>([]);
  const [searchusers, setsearchusers] = useState("");
  const [findtheUsers, setfindtheUsers] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerPage] = useState(2);


  const navigate = useNavigate();

  useEffect(() => {
    const FindAllUsers = async () => {
      const { data } = await axiosClient.get(`${API_CHAT_URL}/getusers`);
      if (data.message === "Get all users") {
        setfindAllUsers(data.getTheuser);
      } else {
        toast.error("No user found here");
      }
    };
    FindAllUsers();
  }, [searchusers]);

  useEffect(() => {
    updateUsers();
  }, [currentPage]);

  const updateUsers = async () => {
    try {
      const { data } = await axiosClient.get(
        `${API_CHAT_URL}/findallusers?page=${currentPage}&limit=${postsPerPage}`
      );
      if (data.message === "Get all users") {
        setgetAlluser(data.Allusers);
        setTotalPosts(data.totalusers);
      } else {
        toast.error("users not found");
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
    if (searchusers) {
      const filtered = findAllUsers.filter((user) =>
        user.name.toLowerCase().includes(searchusers.toLowerCase())
      );
      setfindtheUsers(filtered);
    } else {
      setfindtheUsers([]);
    }
  }, [searchusers, findAllUsers]);

  useEffect(() => {
    const findUsers = async () => {
      try {
        const { data } = await axiosClient.get(`${API_CHAT_URL}/getuserdata`);
        if (data.message === "userId get") {
          setuserID(data.userId);
          setuserinfos(data.userdetail);
          console.log(data.userdetail, "xxxxxxxxxxxxxxxxxxxxxxxxx");
        } else {
          toast.error("no userid found");
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
    findUsers();
  }, []);

  const findUsers = async () => {
    try {
      const { data } = await axiosClient.get(`${API_CHAT_URL}/getuserdata`);
      if (data.message === "userId get") {
        setuserID(data.userId);
        setuserinfos(data.userdetail);
        console.log(data.userdetail, "xxxxxxxxxxxxxxxxxxxxxxxxx");
      } else {
        toast.error("no userid found");
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

  const FindUserSearch = (term: string) => {
    setsearchusers(term);
    const filtered = findAllUsers.filter((user) =>
      user.name.toLowerCase().includes(term.toLowerCase())
    );
    setfindtheUsers(filtered);
  };

  const followUser = async (userId: string, LoguserId: string) => {
    try {
      const { data } = await axiosClient.post(`${API_CHAT_URL}/followuser`, {
        userId,
        LoguserId,
      });
      if (data.message === "followed users") {
        sendfollow(userId, data.Userinfo, data.followingUser);
        updateUsers();
        findUsers();
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
    const getAllPost = async () => {
      try {
        const { data } = await axiosClient.get(
          `${API_CHAT_URL}/findallusers?page=${currentPage}&limit=${postsPerPage}`
        );
        if (data.message === "Get all users") {
          setgetAlluser(data.Allusers);
          setTotalPosts(data.totalusers);
        } else {
          toast.error("All users get fail");
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

    getAllPost();
  }, []);

  

  const viewProfile = async (userID: string) => {
    try {
      if (userID === useridget) {
        navigate("/profile");
      } else {
        navigate("/viewProfile", { state: { userID } });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <SideNavBar />
      <div className="flex mt-12">
        <main className="w-4/5 ml-auto p-0">
          {/* Messages Section */}
          <div className="fixed  bg-black w-full pl-5     pt-5  pb-5">
            <h1
              style={{ fontSize: "25px" }}
              className=" flex text-xl font-bold ml-0"
            >
              Find Friends
            </h1>
          </div>

          <form className=" w-2/4 ml-20  group">
            <div className="mt-24">
              <input
                type="text"
                value={searchusers}
                onChange={(e) => FindUserSearch(e.target.value)}
                placeholder="Find Friends"
                className="w-full pl-12 text-black pr-4 py-3 text-base bg-white rounded-full border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm placeholder:text-gray-400"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </form>
          {findtheUsers.length > 0 && (
            <ul className="absolute z-10 w-1/4 bg-white dark:bg-gray-800 rounded-xl mt-5 ml-20 max-h-48 overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {findtheUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={() => viewProfile(user._id)}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                >
                  <div className="">
                    <img
                      src={user.image}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium"
                      alt=""
                    />
                    {/* {user.name.charAt(0)} */}
                  </div>

                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    {/* Add additional user info if available */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email.toLowerCase().replace(/\s+/g, "_")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-4 p-5  mt-5 w-full h-[100vh]">
            <div className="space-y-4">
              {getAlluser.length === 0 ? (
                <div className="flex justify-center items-center">
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : (
                getAlluser.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-900 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.image}
                        alt="Profile"
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="text-lg font-medium">{user.name}</p>

                        <p className="text-gray-400"></p>
                      </div>
                    </div>
                    <div className="text-blue-500 text-xl font-bold"></div>
                    <div>
                      <button
                        onClick={() => followUser(user._id, userinfos?._id)}
                        color={
                          userinfos?.following.some(
                            (userOne) => userOne === user._id
                          )
                            ? "white"
                            : "blue"
                        }
                        className={
                          userinfos?.following.some(
                            (userOne) => userOne === user._id
                          )
                            ? "mr-10 mb-2 px-4 py-2 text-white font-semibold rounded-full border border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300"
                            : "mr-10 mb-2 px-4 py-2 text-white font-semibold bg-blue-600 rounded-full border border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300"
                        }
                      >
                        {userinfos?.following.some(
                          (userOne) => userOne === user._id
                        )
                          ? "Following"
                          : "Follow"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-center mt-8">
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

export default PeoplePage;
