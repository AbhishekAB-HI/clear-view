import React, { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { store } from "../../Redux-store/Reduxstore";
import { clearuserAccessTocken } from "../../Redux-store/Redux-slice";
import {
  FaChevronLeft,
  FaChevronRight,
  FaComment,
  FaEdit,
  FaInfoCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Navigation } from "swiper/modules";

import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import profileimg from "../images/Userlogo.png";
import EditProfileModal from "./EditProfile";
import Postpage from "./Addpost";
import EditPostModal from "./EditPostPage";
import Clintnew from "../../Redux-store/Axiosinterceptor";
import Navbar2 from "./Navbar2";
import { IPost, IUser, ReplyingToState } from "../Interfaces/Interface";
import {
  API_CHAT_URL,
  API_MESSAGE_URL,
  API_USER_URL,
  CONTENT_TYPE_JSON,
} from "../Constants/Constants";
import EditPasswordModal from "./EditPassword";
import SideNavBar from "./SideNavbar";
import { Heart, InboxIcon, User2Icon, UserIcon, Users, Users2Icon } from "lucide-react";
import RenderReplies from "./RenderReplies";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import EmojiPicker from "emoji-picker-react";
import SideNavBar2 from "./Sidebar2";
import { ThreeDot } from "react-loading-indicators";
const HomeProfilepage = () => {
  type RootState = ReturnType<typeof store.getState>;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [profileInfo, setprofileInfo] = useState<IUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassEdit, setshowPassEdit] = useState(false);
  const [showpostModal, setShowpostModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [UserId, setUserId] = useState<string | null>(null);
  const [userPost, setuserPost] = useState<IPost[]>([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editpostUserId, seteditpostUserId] = useState<string | null>(null);
  const [postid, setPostid] = useState<string | null>(null);
  const [ShoweditpostModal, setShoweditpostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPost, setFilteredPost] = useState<IPost[]>([]);
  const [userinfo, setuserinfo] = useState<IUser | null>(null);
  const [Blockeduserinfo, setBlockeduserinfo] = useState<IUser[] | null>(null);
  const [showLikesList, setShowLikesList] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(null);
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const navigate = useNavigate();
  const [replyingTo, setReplyingTo] = useState<ReplyingToState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4);
  const [totalPosts, setTotalPosts] = useState(0);
  const [activeTab, setActiveTab] = useState("Posts");
  const [userStatus, setuserStatus] = useState(false);
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);



   useEffect(()=>{
     const UserfollowStatus = async()=>{
       try {
       const {data} =await Clintnew.get(`${API_CHAT_URL}/userstatus`);
       } catch (error) {
        console.log(error)
       }
     }
    UserfollowStatus()
   },[])

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
  useEffect(() => {
    const findBlockedUsers = async () => {
      try {
        const { data } = await Clintnew.get(`${API_USER_URL}/blockedUser`);

        if (data.message === "Get Blocked users") {
          setBlockeduserinfo(data.FindUsers);
        }
      } catch (error) {
        console.log(error);
      }
    };

    findBlockedUsers();
  }, []);
  const findBlockedUsers = async () => {
    try {
      const { data } = await Clintnew.get(`${API_USER_URL}/blockedUser`);

      if (data.message === "Get Blocked users") {
        setBlockeduserinfo(data.FindUsers);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const UpdateBlocking = async (
    userId: string,
    LogedUserId: string,
    isActive: boolean
  ) => {
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
           findBlockedUsers();
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

  const renderPageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`
              relative h-8 w-8 rounded-full text-sm font-medium
              transition-all duration-200 ease-in-out
              hover:scale-110 hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
              ${
                currentPage === i
                  ? "bg-blue-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {i}
          </button>
        );
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        pages.push(
          <span key={i} className="px-1 text-gray-400">
            ...
          </span>
        );
      }
    }
    return pages;
  };

  useEffect(() => {
    const getUserinfo = async () => {
      try {
        const { data } = await Clintnew.get(`${API_USER_URL}/getUserinfo`);
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

  const handleCommentClick = (postId: any) => {
    if (showCommentBox === postId) {
      setShowCommentBox(null);
    } else {
      setShowCommentBox(postId);
    }
  };

  const handleReply = (postId: string, commentId: string) => {
    if (replyingTo?.commentId === commentId) {
      setReplyingTo(null);
    } else {
      setReplyingTo({ postId, commentId });
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setComment((prevComment) => prevComment + emojiData.emoji);
  };

  const handleLike = async (postId: string, userId: string) => {
    try {
      const { data } = await axios.patch(
        `${API_USER_URL}/LikePost`,
        { postId, userId },
        {
          headers: {
            "Content-Type": CONTENT_TYPE_JSON,
          },
        }
      );
      if (data.message === "Post liked succesfully") {
        fetchdatas();
      } else {
        toast.error("Post liked Failed");
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

  const handleSendComment = async (postId: string, userId: string) => {
    try {
      if (comment.length === 0) {
        toast.error("please write something...");
      }
      const { data } = await ClientNew.patch(
        `${API_USER_URL}/CommentPost`,
        {
          postId,
          userId,
          comment,
        },
        {
          headers: {
            "Content-Type": CONTENT_TYPE_JSON,
          },
        }
      );
      if (data.message === "Post Commented succesfully") {
        fetchdatas();
        setComment("");
        setShowEmojiPicker(false);
      } else {
        toast.error("Post Commented Failed");
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
    fetchdatas();
  }, [currentPage]);

  const toggleMenu = (postId: any) => {
    if (menuOpen === postId) {
      setMenuOpen(null);
    } else {
      setMenuOpen(postId);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleChangepasswordModal = () => {
    setshowPassEdit(!showPassEdit);
  };

  const togglepostModal = () => {
    setShowpostModal(!showpostModal);
  };

  const toggleeditpostModal = () => {
    setShoweditpostModal(!ShoweditpostModal);
  };

  const handleEditClick = (id: string) => {
    setSelectedUserId(id);

    setShowModal(true);
  };

  const handleChangePasswordClick = (id: string) => {
    setSelectedUserId(id);
    setshowPassEdit(true);
  };

  const handlepostClick = (id: string) => {
    setUserId(id);
    setShowpostModal(true);
  };

  const handleeditpostClick = (postid: string) => {
    setPostid(postid);
    setShoweditpostModal(true);
  };

  const dispatch = useDispatch();
  const usertocken = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const { data } = await Clintnew.get(`${API_USER_URL}/userprofile`);
        if (data.message === "User Profile found") {
          setprofileInfo(data.getdetails);
        } else {
          toast.error("User Profile Not found");
        }

        const response = await Clintnew.get(
          `${API_USER_URL}/userposts?page=${currentPage}&limit=${postsPerPage}`
        );
        if (response.data.message === "User Post found") {
          setuserPost(response.data.posts);
          setFilteredPost(response.data.posts);
          setTotalPosts(response.data.total);
        } else {
          toast.error("User post Not found");
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
    fetchdata();
  }, []);

  const fetchProfiledata = async () => {
    try {
      const { data } = await Clintnew.get(`${API_USER_URL}/userprofile`);
      if (data.message === "User Profile found") {
        setprofileInfo(data.getdetails);
      } else {
        toast.error("User Profile Not found");
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

  const updateProfileState = () => {
    fetchProfiledata();
  };

  const updateState = () => {
    fetchdatas();
  };

  const fetchdatas = async () => {
    try {
      handleCommentClick;
      const response = await Clintnew.get(
        `${API_USER_URL}/userposts?page=${currentPage}&limit=${postsPerPage}`
      );
      if (response.data.message === "User Post found") {
        setuserPost(response.data.posts);
        setFilteredPost(response.data.posts);
        setTotalPosts(response.data.total);
      } else {
        toast.error("User post Not found");
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

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query === "") {
      setFilteredPost(userPost);
    } else {
      const filtered = userPost.filter((user) =>
        user.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPost(filtered);
    }
  };

  const handleDeletepost = async (id: string) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await axios.delete(
            `${API_USER_URL}/deletepost/${id}`
          );

          if (response.data.message === "Post deleted successfully") {
            toast.success("Post deleted successfully");
            fetchdatas();
            if (filteredPost.length === 1) {
              fetchdatas();
              window.location.reload();
            }
          } else {
            toast.error("Post deleted Failed");
          }
        } else {
          fetchdatas();
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


  
  const [Loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [userID, setuserID] = useState<string>("");
  const [userFound, setuserFound] = useState(null);
  const [menuOpenPost, setMenuOpenPost] = useState<string | null>(null);
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

  const handleBlockUser = async (
    userId: string,
    LogedUserId: string,
    isActive: boolean
  ) => {
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
      console.log(userFound, "22222222222222222222222222222");
    }, [userFound]);



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





























  

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <SideNavBar2 />

      <div className="flex mt-12">
        {/* Sidebar */}

        {/* Main Content */}
        <main className="w-full md:w-4/5 ml-auto p-4">
          {/* Tabs */}
          <div
            style={{ fontSize: "20px" }}
            className="flex w-full md:w-4/5 ml-auto  space-x-5 md:space-x-10 mb-4 text-green border-b border-gray-700 fixed top-20 pt-3 bg-black z-40"
          >
            <h1 className="mb-5" style={{ fontSize: "25px" }}>
              Profile page
            </h1>
          </div>

          {/* Posts */}
          <div className="mt-0">
            <div className="max-w-screen-lg mx-auto bg-black text-white rounded-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start mt-10">
                {profileInfo ? (
                  <div className="flex flex-col md:flex-row items-center">
                    <img
                      src={profileInfo.image ? profileInfo.image : profileimg}
                      alt="Profile"
                      className="w-20 h-20 md:w-32 md:h-32 rounded-full mr-6"
                    />
                    <div className="text-left mt-4 md:mt-3">
                      <h2 className="text-xl md:text-2xl font-semibold  ">
                        {profileInfo.name}
                      </h2>
                      <p className="text-gray-400 text-sm md:text-base  md:mt-1">
                        {profileInfo.email}
                      </p>
                      {/* <p className="text-gray-400 text-sm md:text-base">
                        Joined:{" "}
                        {new Date(profileInfo.createdAt).toLocaleDateString()}
                      </p> */}
                      <p className="text-gray-400 mt-2 text-sm md:text-base">
                        Posts: {totalPosts || 0} <br />
                      </p>
                      <p className="text-gray-400 text-sm md:text-base">
                        Following: {userinfo?.following?.length || 0} <br />
                        Followers: {userinfo?.followers?.length || 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Loading profile...</p>
                )}

                {/* Buttons container for better alignment */}
                {profileInfo && (
                  <div className="flex flex-col mt-5 md:mt-5">
                    <button
                      onClick={() => handleEditClick(profileInfo._id)}
                      className="flex items-center  bg-transparent text-white border border-white rounded-full px-4 py-2 mb-2 hover:bg-gray-700"
                    >
                      <FaEdit className="mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => handleChangePasswordClick(profileInfo._id)} // Updated function call for clarity
                      className="flex mt-5 items-center bg-transparent text-white border border-white rounded-full px-4 py-2 hover:bg-gray-700"
                    >
                      <FaEdit className="mr-2" />
                      Change Password
                    </button>
                    <button
                      onClick={() => handlepostClick(profileInfo._id)} // Updated function call for clarity
                      className="flex mt-10 items-center bg-blue-500 text-white text-center w-30  rounded-full px-12 py-3 hover:bg-blue-600 "
                    >
                      Create post
                    </button>
                  </div>
                )}
                {/* <div className="   mb-5  ">
                  <div className=" mr-6 ">
                    {profileInfo && (
                      <button
                        onClick={() => handlepostClick(profileInfo._id)}
                        className="bg-blue-500 text-white text-center  rounded-full px-8 py-1 hover:bg-blue-600 "
                      >
                        Create post
                      </button>
                    )}
                  </div>
                </div> */}
              </div>

              {showModal && (
                <EditProfileModal
                  updateProfileState={updateProfileState}
                  toggleModal={toggleModal}
                  userid={selectedUserId}
                />
              )}

              {showPassEdit && (
                <EditPasswordModal
                  updateProfileState={updateProfileState}
                  toggleModal={toggleChangepasswordModal}
                  userid={selectedUserId}
                />
              )}

              <div className="mt-5  items-center">
                <div className="flex w-full md:w- ml-0  space-x-5 md:space-x-10 mb-4 text-green border-b border-gray-700  pt-3 bg-black z-40">
                  <span
                    className={`cursor-pointer border-b-4   ${
                      activeTab === "Posts"
                        ? "font-bold border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => handleTabClick("Posts")}
                  >
                    Posts
                  </span>
                  <span
                    className={`cursor-pointer border-b-4   ${
                      activeTab === "Blocked users"
                        ? "font-bold border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => handleTabClick("Blocked users")}
                  >
                    Blocked users
                  </span>
                  <span
                    className={`cursor-pointer border-b-4  ${
                      activeTab === "Followers"
                        ? "font-bold border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => handleTabClick("Followers")}
                  >
                    Followers
                  </span>
                  <span
                    className={`cursor-pointer border-b-4  ${
                      activeTab === "Following"
                        ? "font-bold border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => handleTabClick("Following")}
                  >
                    Following
                  </span>
                  <span
                    className={`cursor-pointer border-b-4  ${
                      activeTab === "people"
                        ? "font-bold border-blue-500"
                        : "border-transparent"
                    }`}
                    onClick={() => handleTabClick("people")}
                  >
                    People
                  </span>
                </div>

                {showpostModal && (
                  <Postpage
                    togglepostModal={togglepostModal}
                    updateState={updateState}
                    userid={UserId}
                  />
                )}
                {ShoweditpostModal && (
                  <EditPostModal
                    toggleeditpostModal={toggleeditpostModal}
                    postid={postid}
                    updateState={updateState}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-5">
            {activeTab === "Posts" &&
              filteredPost.map((post) => (
                <div key={post._id} className="mb-4">
                  <div className="flex justify-between items-center space-x-4">
                    {/* Profile Information */}
                    <div className="flex items-center space-x-4">
                      {profileInfo && (
                        <img
                          src={
                            profileInfo.image ? profileInfo.image : profileimg
                          }
                          alt="image"
                          className="rounded-full w-8 h-8 md:w-10 md:h-10"
                        />
                      )}
                      {profileInfo && (
                        <span className="font-semibold text-sm md:text-base">
                          {profileInfo.name}
                        </span>
                      )}
                    </div>

                    {/* Three-Dot Menu */}
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(post._id)}
                        className="text-gray-100 hover:text-gray-500"
                        style={{ marginLeft: "100px" }}
                      >
                        &#x22EE; {/* Vertical three-dot symbol */}
                      </button>

                      {/* Dropdown Menu */}
                      {menuOpen === post._id && (
                        <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              handleeditpostClick(post._id);
                            }}
                            className="block w-full text-left font-medium px-4 py-2 text-black hover:text-blue-500"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              handleDeletepost(post._id);
                              setMenuOpen(null);
                            }}
                            className="block w-full text-left font-medium px-4 py-2 text-black hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-md pb-5 text-left  text-white">
                      {post.description}
                    </p>
                    {post.image.length > 0 || post.videos.length > 0 ? (
                      <div className="max-w-full mx-auto">
                        {(post.image || post.videos) && (
                          <div className="h-[50vh] md:h-[60vh] lg:h-[70vh] mb-4">
                            <Swiper
                              modules={[Pagination, Navigation]}
                              spaceBetween={10}
                              slidesPerView={1}
                              navigation={
                                (post.image && post.image.length > 1) ||
                                post.image.length + post.videos.length > 1 ||
                                (post.videos && post.videos.length > 1)
                                  ? {
                                      nextEl: ".swiper-button-next-media",
                                      prevEl: ".swiper-button-prev-media",
                                    }
                                  : false
                              }
                              pagination={{ clickable: true }}
                              className="w-full h-full relative"
                            >
                              {/* Combine images and videos */}
                              {[
                                ...(post.image || []),
                                ...(post.videos || []),
                              ].map((mediaSrc, index) => (
                                <SwiperSlide
                                  key={index}
                                  className="flex items-center justify-center"
                                >
                                  <div className="relative w-full h-full">
                                    {/* Check if it's an image or video by file extension */}
                                    {typeof mediaSrc === "string" &&
                                    mediaSrc.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                      <img
                                        src={mediaSrc}
                                        alt={`post-media-${index}`}
                                        className="absolute inset-0 w-full h-full object-contain"
                                      />
                                    ) : (
                                      <video
                                        controls
                                        className="w-full h-full object-contain"
                                      >
                                        <source
                                          src={mediaSrc}
                                          type="video/mp4"
                                        />
                                      </video>
                                    )}
                                  </div>
                                </SwiperSlide>
                              ))}
                              {(post.image && post.image.length > 1) ||
                              post.image.length + post.videos.length > 1 ||
                              (post.videos && post.videos.length > 1) ? (
                                <>
                                  <button className="swiper-button-prev-media absolute top-1/2 left-4 transform -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all">
                                    &#8592;
                                  </button>
                                  <button className="swiper-button-next-media absolute top-1/2 right-4 transform -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all">
                                    &#8594;
                                  </button>
                                </>
                              ) : null}
                            </Swiper>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>

                  <div className="mainLikebar flex justify-around mt-4 text-sm sm:text-base">
                    {showLikesList && (
                      <div className="absolute z-20 mr-40    w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                        <div className="p-4  ">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {post.likeCount} Likes
                            </span>
                            <Users
                              size={18}
                              className="text-gray-500 dark:text-gray-400"
                            />
                          </div>
                          <div className="mt-4 max-h-40 overflow-y-auto">
                            {post.likes.map((like) => (
                              <div
                                key={like._id}
                                className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md cursor-pointer"
                              >
                                <span className="text-gray-900 dark:text-gray-100">
                                  {like.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      onClick={() => handleLike(post._id, userinfo?._id)}
                      className="Likebutton flex hover:text-blue-600 cursor-pointer hover:scale-110 transition-transform duration-200"
                    >
                      <div className="relative">
                        <div
                          onMouseEnter={() => setShowLikesList(true)}
                          onMouseLeave={() => setShowLikesList(false)}
                          className="flex items-center hover:text-blue-600 cursor-pointer hover:scale-110 transition-transform duration-200"
                        >
                          <Heart
                            size={20}
                            className={`${
                              post.likes.some(
                                (like) => like._id === userinfo?._id
                              )
                                ? "text-blue-600 fill-blue-600"
                                : "text-gray-500 dark:text-gray-400 fill-transparent"
                            }`}
                          />
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            {post.likeCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => handleCommentClick(post._id)}
                      className="Likebutton flex hover:text-blue-600 cursor-pointer hover:scale-110 transition-transform duration-200"
                    >
                      <span className="mr-2">{post.comments.length}</span>
                      <FaComment size="20px" color="blue" />
                      <h1 className="pl-2">Comment</h1>
                    </div>
                  </div>

                  {showCommentBox === post._id && (
                    <div className="mt-10">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 bg-blue-600 text-white rounded-md"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          😊
                        </button>
                        <input
                          type="text"
                          className="border p-2 w-full text-black rounded-md"
                          placeholder="Write a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                          className="p-2 bg-blue-600 text-white rounded-md"
                          onClick={() =>
                            handleSendComment(post._id, userinfo?._id)
                          }
                        >
                          <FaPaperPlane />
                        </button>
                      </div>

                      {showEmojiPicker && (
                        <div className="mt-2">
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}

                      <RenderReplies
                        UpdateLikepost={fetchdatas}
                        post={post}
                        parentCommentId={comment._id}
                        saveid={userinfo?._id}
                        replyingTo={replyingTo}
                        replyContent={replyContent}
                        handleReply={handleReply}
                        setReplyContent={setReplyContent}
                      />
                    </div>
                  )}
                </div>
              ))}

            {activeTab === "Blocked users" && (
              <div>
                {Blockeduserinfo && Blockeduserinfo?.length > 0 ? (
                  Blockeduserinfo?.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-5 w-full">
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
                          onClick={() =>
                            UpdateBlocking(
                              user?._id,
                              profileInfo?._id,
                              userStatus
                            )
                          }
                          className={`
                          w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
                            ${
                              userStatus
                                ? "bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300 shadow-md hover:shadow-lg"
                                : "bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300 shadow-md hover:shadow-lg"
                            }
                        active:scale-95 
                        disabled:opacity-50 
                        disabled:cursor-not-allowed
                        flex items-center justify-center
                        space-x-2
                        `}
                        >
                          {userStatus ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0012 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          )}
                          {userStatus ? "Block User" : "Unblock User"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative mb-10 h-[500px] flex flex-col items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Icon with animation */}
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-sm animate-pulse" />
                          <Users2Icon
                            size={48}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </div>

                        {/* Text content */}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          No blocked users
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                          Looks like there aren't any posts yet. Check back
                          later
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "Following" && (
              <div>
                {userinfo?.following && userinfo?.following.length > 0 ? (
                  userinfo?.following?.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-5 w-full">
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
                          onClick={() =>
                            UpdateBlocking(
                              user?._id,
                              profileInfo?._id,
                              userStatus
                            )
                          }
                          className={`
                          w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
                            ${
                              userStatus
                                ? "bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300 shadow-md hover:shadow-lg"
                                : "bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300 shadow-md hover:shadow-lg"
                            }
                        active:scale-95 
                        disabled:opacity-50 
                        disabled:cursor-not-allowed
                        flex items-center justify-center
                        space-x-2
                        `}
                        >
                          {userStatus ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0012 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          )}
                          {userStatus ? "Block User" : "Unblock User"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative mb-10 h-[500px] flex flex-col items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Icon with animation */}
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-sm animate-pulse" />
                          <Users2Icon
                            size={48}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </div>

                        {/* Text content */}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          0 following
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                          Looks like there aren't any posts yet. Check back
                          later
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "Followers" && (
              <div>
                {userinfo?.followers && userinfo?.followers.length > 0 ? (
                  userinfo?.followers?.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-5 w-full">
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
                          onClick={() =>
                            UpdateBlocking(
                              user?._id,
                              profileInfo?._id,
                              userStatus
                            )
                          }
                          className={`
                          w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
                            ${
                              userStatus
                                ? "bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300 shadow-md hover:shadow-lg"
                                : "bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300 shadow-md hover:shadow-lg"
                            }
                        active:scale-95 
                        disabled:opacity-50 
                        disabled:cursor-not-allowed
                        flex items-center justify-center
                        space-x-2
                        `}
                        >
                          {userStatus ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0012 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          )}
                          {userStatus ? "Block User" : "Unblock User"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative mb-10 h-[500px] flex flex-col items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Icon with animation */}
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-sm animate-pulse" />
                          <Users2Icon
                            size={48}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </div>

                        {/* Text content */}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          0 followers
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                          Looks like there aren't any posts yet. Check back
                          later
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "people" && (
              <div className="space-y-4 p-5  w-full ">
                <div className="space-y-4">
                  {/* Loading or Results */}
                  {Loading ? (
                    <div className="flex justify-center items-center">
                      <ThreeDot
                        className="w-20 h-3 space-x-10"
                        color="#3168cc"
                      />
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
            )}

            {activeTab === "Posts" && (
              <div className="flex justify-center items-center space-x-4 p-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`
                    flex items-center justify-center h-8 w-8 rounded-full
                    transition-all duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                     ${
                       currentPage === 1
                         ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110"
                     }
                  `}
                >
                  <FaChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center space-x-2">
                  {renderPageNumbers()}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`
                   flex items-center justify-center h-8 w-8 rounded-full
                   transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                   ${
                     currentPage === totalPages
                       ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                       : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110"
                   }
               `}
                >
                  <FaChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeProfilepage;
