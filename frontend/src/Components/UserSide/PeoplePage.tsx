import { useNavigate } from "react-router-dom";
import {
  FaInfoCircle,

} from "react-icons/fa";
import toast from "react-hot-toast";
import { FormEvent, useEffect, useState } from "react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import ThreeDot from "react-loading";

import { store } from "../../Redux-store/Reduxstore";
import Swal from "sweetalert2";
import axios from "axios";
import Navbar2 from "./Navbar2";
import SideBar2 from "./Sidebar2";
import {
  API_CHAT_URL,
  API_MESSAGE_URL,
  API_USER_URL,
  CONTENT_TYPE_JSON,
} from "../Constants/Constants";
import { IUser } from "../Interfaces/Interface";
import SideNavBar from "./SideNavbar";
const PeoplePage = () => {
 
  const [Loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [userID, setuserID] = useState<string>("");
  const [userFound, setuserFound] = useState(false);
  const [userStatus, setuserStatus] = useState(false);
  type RootState = ReturnType<typeof store.getState>;
  const [menuOpenPost, setMenuOpenPost] = useState<string | null>(null);
  const navigate = useNavigate();
  const updateUsers = async () => {
    try {
      const { data } = await ClientNew.get(`${API_CHAT_URL}/findallusers`, {
        headers: {
          "Content-type": CONTENT_TYPE_JSON,
        },
      });

      if (data.message === "Get all users") {
        setgetAlluser(data.Allusers);
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

  const handleMenuClick = (userId: string) => {
    setMenuOpenPost(menuOpenPost === userId ? null : userId);
  };

  const handleBlockUser = async (userId: string,LogedUserId: string,isActive: boolean) => {
    console.log(userId, "userId");
    console.log(LogedUserId, "LogedUserId");

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
    const findUsers = async () => {
      try {
        const { data } = await ClientNew.get(`${API_CHAT_URL}/getUserdata`);
        if (data.message === "userId get") {
          setuserID(data.userId);
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

  const followUser = async (userId: string, LoguserId: string) => {
    try {
      const { data } = await ClientNew.post(
        `${API_CHAT_URL}/followuser`,
        { userId, LoguserId },
        {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        }
      );

      if (data.message === "followed users") {
        setuserFound(data.addFollower);
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
    const getAllPost = async () => {
      try {
        const { data } = await ClientNew.get(`${API_CHAT_URL}/findallusers`, {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        });

        if (data.message === "Get all users") {
          setgetAlluser(data.Allusers);
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

  const handleReport = async (userID: string) => {
    const { value: text } = await Swal.fire({
      input: "textarea",
      inputLabel: "Report User",
      inputPlaceholder: "Type here...",
      inputAttributes: {
        "aria-label": "Type your message here",
      },
      showCancelButton: true,
    });
    if (text) {
      try {
        const { data } = await ClientNew.patch(
          `${API_USER_URL}/ReportUser`,
          { userID, text },
          {
            headers: {
              "Content-Type": CONTENT_TYPE_JSON,
            },
          }
        );

        if (data.message === "user Reported succesfully") {
          toast.success("User Reported succesfully");
        } else {
          toast.error("User Reported Fails");
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
    } else {
      if (text.length === 0) {
        Swal.fire("Please text here");
      }
      navigate("/homepage");
    }

    try {
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!search) {
      throw new Error("No search ID");
    }
    try {
      setLoading(true);
      const { data } = await ClientNew.get(
        `${API_USER_URL}/searched?search=${search}`,
        {
          headers: {
            "Content-Type": CONTENT_TYPE_JSON,
          },
        }
      );

      if (data.message === "get all users") {
        setSearchResult(data.SearchedUsers);
        setLoading(false);
      } else {
        toast.error("No user found");
      }
    } catch (error) {
      setLoading(false);
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
      <div className="flex mt-12">
        <main className="w-4/5 ml-auto p-0">
          {/* Messages Section */}
          <div className="fixed  bg-black w-full pl-5     pt-5  pb-5">
            <h1
              style={{ fontSize: "25px" }}
              className=" flex text-xl font-bold ml-0"
            >
              People
            </h1>
          </div>
          <div className="space-y-4 p-5  mt-20 w-full h-[100vh]">
            <div className="space-y-4">
              {/* Loading or Results */}
              {Loading ? (
                <div className="flex justify-center items-center">
                  <ThreeDot className="w-20 h-3 space-x-10" color="#3168cc" />
                </div>
              ) : getAlluser.length === 0 ? (
                <div className="flex justify-center items-center">
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : (
                getAlluser.map((user, index) => (
                  <div
                    key={user._id}
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
                        onClick={() => followUser(user._id, userID)}
                        color={!userFound ? "blue" : "white"}
                        className={
                          !userFound
                            ? "mr-10 mb-2 px-4 py-2 text-white font-semibold rounded-full border border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300"
                            : "mr-10 mb-2  px-4 py-2 text-white font-semibold bg-blue-600 rounded-full border border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300"
                        }
                      >
                        {!userFound ? "Following" : "Follow"}
                      </button>

                      {menuOpenPost === user?._id && (
                        <div
                          className="absolute right-25 mt-2 w-40 rounded-md shadow-lg bg-gray-800 text-white ring-1 ring-black ring-opacity-5"
                          onMouseLeave={() => setMenuOpenPost(null)}
                        >
                          <button
                            onClick={() =>
                              handleBlockUser(user?._id, userID, userStatus)
                            }
                            className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                          >
                            {userStatus ? "Block User" : "UnBlock User"}
                          </button>
                          <button
                            onClick={() => handleReport(user._id)}
                            className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                          >
                            Report User
                          </button>
                          {/* Add more options here */}
                        </div>
                      )}
                      <button
                        className="mt-2"
                        onClick={() => handleMenuClick(user?._id)}
                      >
                        {" "}
                        <FaInfoCircle size="30px" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PeoplePage;
