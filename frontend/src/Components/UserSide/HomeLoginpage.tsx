import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import logoWeb from "../animations/Animation - 1724244656671.json";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { store } from "../../Redux-store/reduxstore";
import { clearuserAccessTocken } from "../../Redux-store/redux-slice";
import { FaBars, FaComment, FaPaperPlane, FaUserCircle } from "react-icons/fa";
import { MdMoreVert } from "react-icons/md";
import profileimg from "../images/Userlogo.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import EmojiPicker from "emoji-picker-react";
import { AiOutlineSearch } from "react-icons/ai";
import Posthomepage from "../UserSide/AddpostHome";
import { Pagination, Navigation } from "swiper/modules";
import RenderReplies from "../UserSide/RenderReplies";
import { Home, MessageSquare, Bell, Plus, InboxIcon } from "lucide-react";
import {
  ActiveUsersType,
  IAllNotification,
  IPost,
  Notification,
  ReplyingToState,
} from "../Interfaces/Interface";
import { Swiper, SwiperSlide } from "swiper/react";
import debounce from "lodash.debounce";
import { Heart, Users } from "lucide-react";
import io, { Socket } from "socket.io-client";
import axiosClient from "../../Services/Axiosinterseptor";
import moment from "moment";
import {
  commentThePost,
  findAllposthome,
  getnotifications,
  reportThePost,
  updatelastseen,
} from "../../Services/User_API/Homepageapis";
import { getuserinfomations } from "../../Services/User_API/FollowerApi";
import { API_USER_URL } from "../Constants/Constants";

let selectedChatCompare: any;
const ENDPOINT = "http://localhost:3000";
let socket: Socket;
const HomeLoginPage = () => {
  type RootState = ReturnType<typeof store.getState>;

  // STATE_MANAGEMENT===============================================================================================================================================================

  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPost, setFilteredPost] = useState<IPost[]>([]);
  const [menuOpenPost, setMenuOpenPost] = useState<string | null>(null);
  const [saveid, setsaveid] = useState<string | any>(null);
  const [showCommentBox, setShowCommentBox] = useState(null);
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingToState | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [AccOpen, setAccOpen] = useState(false);
  const [SaveAllNotifications, setSaveAllNotifications] = useState<
    Notification[]
  >([]);
  const [Category, setCategory] = useState("Allpost");
  const [showLikesList, setShowLikesList] = useState(false);
  const [savelikeNotify, setsavelikeNotify] = useState<IAllNotification>();
  const [Savenewpost, setSavenewpost] = useState<IAllNotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const userDetails = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );

  const [showpostModal, setShowpostModal] = useState(false);

  moment.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years",
    },
  });

  const formatTime = (timestamp: string): string => {
    const postTime = moment(timestamp);
    return postTime.fromNow();
  };

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
      const response = await getnotifications();
      if (response.success) {
        setSaveAllNotifications(response.notifications);
      } else {
        toast.error("All notifications Failed");
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

  const logoutUser = (userId: string) => {
    socket.emit("logout", userId);
  };

  useEffect(() => {
    socket.on("Likenotification", (postDetails) => {
      toast.success("User Liked your post");
      setsavelikeNotify(postDetails);
    });

    socket.on("follow received", (followingUser) => {
      toast.success("User follow you");
      setSavenewpost(followingUser);
    });

    socket.on("post update", (postdetails) => {
      toast.success("new post uploaded");
      setSavenewpost(postdetails);
    });
  }, []);

  // STATE_MANAGEMENT===============================================================================================================================================================

  const handlepostClick = () => {
    setShowpostModal(true);
  };

  const togglepostModal = () => {
    setShowpostModal(!showpostModal);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // STATE_MANAGEMENT===============================================================================================================================================================

  // API ====================================================================================================================================================

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await getuserinfomations();
        if (response.success) {
          setsaveid(response.useridfound);
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
  }, []);

  const lastPostRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const UpdateHomestate = (page: number) => {
    findAllthepost(page);
  };

  const debouncedGetAllPost = useCallback(
    debounce(async (currentpage: number) => {
      setIsLoading(true);
      try {
        const response = await findAllposthome(
          searchQuery,
          Category,
          currentpage
        );

        if (response.success) {
          setFilteredPost((prev) => [...prev,...response.allposts]);
          const totalPages = response.totalPages || 0;
          setHasMore(currentpage < totalPages);
        } else {
          toast.error("Failed to retrieve post details.");
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
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [searchQuery, Category]
  );

  const findAllthepost = async (currentpage: number) => {
    setIsLoading(true);
    try {
      const response = await findAllposthome(
        searchQuery,
        Category,
        currentpage
      );
      if (response.success) {
        setFilteredPost([...response.allposts]);
        const totalPages = response.totalPages || 0;
        setHasMore(currentpage < totalPages);
      } else {
        toast.error("Failed to retrieve post details.");
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    findAllthepost(page);
  }, [Category]);

  useEffect(() => {
    setPage(1);
    findAllthepost(page);
  }, [searchQuery]);

  useEffect(() => {
    debouncedGetAllPost(page);
  }, [page]);

  const handleAllPost = (value: string) => {
    setCategory(value);
  };

  // const totalPages = Math.ceil(totalPosts / postsPerPage);

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

  const navigate = useNavigate();
  const [activeUsers, setActiveUsers] = useState<ActiveUsersType[]>([]);

  const LogoutActiveUsershere = (
    setActiveUsers: React.Dispatch<React.SetStateAction<ActiveUsersType[]>>
  ) => {
    socket.emit("get-users", (users: ActiveUsersType[]) => {
      setActiveUsers(users);
    });
  };
  console.log(activeUsers);
  const handleLogout = async () => {
    try {
      logoutUser(saveid);
      LogoutActiveUsershere(setActiveUsers);
      const response = await updatelastseen();
      if (response.success) {
        toast.success("Logout successfull");
        navigate("/login");
      } else {
        toast.error("Logout failed");
      }
      dispatch(clearuserAccessTocken());
      localStorage.removeItem("usertocken");
    } catch (error) {
      console.log(error);
    }
  };

  const handleMenuClick = (postId: string) => {
    setMenuOpenPost(menuOpenPost === postId ? null : postId);
  };

  const handleReport = async (postId: string, userId: string) => {
    const reportReasons: { [key: string]: string } = {
      "1": "Inappropriate content",
      "2": "Spam or misleading",
      "3": "Harassment or bullying",
      "4": "I don't want to see this",
      "6": "Adult content",
      "5": "Other (please specify)",
    };

    const { value: reasonKey } = await Swal.fire({
      title: "Report Post",
      input: "select",
      inputOptions: reportReasons,
      inputPlaceholder: "Select a reason",
      showCancelButton: true,
      confirmButtonText: "Next",
      inputValidator: (value) => {
        if (!value) {
          return "Please select a reason!";
        }
      },
    });

    if (reasonKey) {
      let text = reportReasons[reasonKey as keyof typeof reportReasons];

      if (reasonKey === "5") {
        const { value: customText } = await Swal.fire({
          input: "textarea",
          inputLabel: "Please specify the reason",
          inputPlaceholder: "Type your reason here...",
          inputAttributes: {
            "aria-label": "Type your message here",
          },
          showCancelButton: true,
        });

        text = customText;
      }

      if (text && text.trim().length > 0) {
        try {
          const response = await reportThePost(postId, text, userId);

          if (response.success) {
            toast.success("Post Reported successfully");
          } else {
            toast.error("Failed to Report");
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
      }
    }
  };

  const viewProfile = async (userID: string) => {
    try {
      if (userID === saveid) {
        navigate("/profile");
      } else {
        navigate("/viewProfile", { state: { userID } });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendComment = async (postId: string, userId: string) => {
    try {
      if (comment.length === 0) {
        toast.error("please write something...");
      }
      const response = await commentThePost(postId, userId, comment);
      if (response.success) {
        debouncedGetAllPost(page);
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

  const sendLikePost = async (postdetails: IAllNotification) => {
    try {
      if (socket) {
        socket.emit("likepost", postdetails);
      }
    } catch (error) {
      console.error("Error fetching or emitting data:", error);
    }
  };

  const handleLike = async (postId: string, userId: string) => {
    try {
      // const response = await likeupdate(postId, userId);
      const { data } = await axiosClient.patch(`${API_USER_URL}/likepost`, {postId,userId});
      if (data.message === "Post liked succesfully") {
        debouncedGetAllPost(page);
        sendLikePost(data.getupdate);
        console.log(data.getupdate, "22222222222222222");
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

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPage(1);
  };

  // PAGE VIEW =================================================================================================================================================================
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navbar----------------------------------------------------------------------- */}
      <nav className="fixed w-full top-0 left-0 z-50 bg-black border-b border-gray-700">
        <div className="px-4 py-3 pb-6 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Lottie
                animationData={logoWeb}
                className="w-12 sm:w-16 md:w-20"
              />
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: "Viaoda Libre" }}
              >
                Clear View
              </h1>
            </div>

            <form className="hidden lg:flex items-center space-x-2">
              <input
                type="search"
                onChange={handleSearch}
                placeholder="Search"
                className="bg-gray-800 text-white px-5 py-1 rounded-full outline-none w-full sm:w-64 md:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" // Enhanced styling
              />
            </form>

            <div className="flex items-center space-x-4 md:space-x-6 lg:mr-10 text-white text-base md:text-lg">
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

        {/* Mobile Search Form */}
        <div className="">
          {showMobileSearch && (
            <form className="lg:hidden flex justify-center mt-10 px-4">
              <input
                type="search"
                onChange={handleSearch}
                placeholder="Search"
                className="bg-gray-800 text-white px-3 py-1 mb-5   rounded-full outline-none w-full"
              />
            </form>
          )}
        </div>
      </nav>

      {/* Navbar----------------------------------------------------------------------- */}

      <div className="flex ">
        {/* Sidebar --------------------------------------------------------------------- */}
        {/* <SideBar /> */}
        <button
          className="md:hidden fixed  top-20  left-0 z-50 text-2xl text-white focus:outline-none"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed top-24  left-0 h-full bg-black text-gray-100 w-60 p-6 space-y-6 
        shadow-xl transition-all duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:w-72 md:left-0`}
        >
          {/* Create Post Button */}
          <button
            onClick={() => handlepostClick()}
            className="w-full bg-blue-600 mt-10 hover:bg-blue-700 text-white rounded-lg px-4 py-3 
             transition-all duration-200 flex items-center justify-center space-x-2 font-medium
             shadow-lg hover:shadow-blue-500/20"
          >
            <Plus size={20} />
            <span>Create Post</span>
          </button>

          {/* Navigation Links */}

          <nav className="space-y-2">
            {[
              { icon: <Home size={24} />, text: "Home", path: "/homepage" },
              {
                icon: <MessageSquare size={24} />,
                text: "Messages",
                path: "/message",
                notificationCount: SaveAllNotifications.length
                  ? SaveAllNotifications.length
                  : null,
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
                  savelikeNotify !== undefined || Savenewpost.length !== 0,
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
                {item.text === "Messages" && item?.notificationCount && (
                  <span className="absolute top-0 left-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {item.notificationCount}
                  </span>
                )}

                {item.text === "Notifications" && item?.followNotification && (
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

        {/* Sidebar --------------------------------------------------------------------- */}
        {/* Main Content */}
        <main className="w-full  lg:w-4/5  ml-auto p-4">
          {/* Tabs */}
          <div
            style={{ fontSize: "16px" }}
            className="fixed  top-20 left-50 w-4/5   border-l border-t   mt-0 border-b  border-gray-700  sm:w-4/5 lg:w-4/5  z-50 bg-black text-white overflow-x-auto px-4 py-1 flex items-center justify-start space-x-5 lg:space-x-20 flex-wrap"
          >
            <button
              onClick={() => handleAllPost("Allpost")}
              className={`pb-3 border-b-4 sm:text-sm  hover:lg:text-lg transform transition-all duration-200 ${
                Category === "Allpost"
                  ? "border-blue-500  lg:text-lg"
                  : "border-transparent"
              } hover:text-blue-300`}
            >
              All posts
            </button>
            <button
              onClick={() => handleAllPost("Latest news")}
              className={`pb-3 border-b-4  sm:text-sm  transform hover:lg:text-lg  transition-all duration-200 ${
                Category === "Latest news"
                  ? "border-blue-500 lg:text-lg"
                  : "border-transparent"
              } hover:text-blue-300`}
            >
              Latest News
            </button>
            <button
              onClick={() => handleAllPost("Breaking news")}
              className={`pb-3 border-b-4 transform  hover:lg:text-lg  sm:text-sm transition-all duration-200 ${
                Category === "Breaking news"
                  ? "border-blue-500 lg:text-lg"
                  : "border-transparent"
              } hover:text-blue-300`}
            >
              Breaking News
            </button>
            <button
              onClick={() => handleAllPost("Sports news")}
              className={`pb-3 border-b-4 transform  hover:lg:text-lg  sm:text-sm transition-all duration-200 ${
                Category === "Sports news"
                  ? "border-blue-500 lg:text-lg"
                  : "border-transparent"
              } hover:text-blue-300`}
            >
              Sports News
            </button>
          </div>

          {/* Posts */}
          <div className="mt-36  ">
            {showpostModal && (
              <Posthomepage
                togglepostModal={togglepostModal}
                updatehomeState={UpdateHomestate}
                userid={saveid}
              />
            )}
            {filteredPost && filteredPost.length > 0 ? (
              filteredPost.map((post, index) => {
                if (index === filteredPost.length - 1) {
                  return (
                    <div
                      ref={lastPostRef}
                      key={index}
                      className="relative mb-8 cursor-pointer p-4 border border-gray-700 rounded-md"
                    >
                      <div className="flex items-center justify-between flex-wrap">
                        <div onClick={() => viewProfile(post.user._id)}>
                          <div className="flex items-center">
                            <img
                              src={
                                post.user.image ? post.user.image : profileimg
                              }
                              alt="Profile"
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="ml-4">
                              <h2 className="text-lg font-semibold">
                                {post.user.name}
                              </h2>
                              <p className="text-md text-green-500  ">
                                {post.category}
                              </p>
                            </div>
                          </div>
                        </div>
                        {post.user._id !== saveid && (
                          <button
                            className="text-gray-400 hover:text-white mt-2 lg:mt-0"
                            onClick={() => handleMenuClick(post._id)}
                          >
                            <MdMoreVert />
                          </button>
                        )}
                      </div>

                      {menuOpenPost === post._id && (
                        <div
                          className="absolute right-4 mt-2 w-40 rounded-md shadow-lg bg-gray-800 text-white ring-1 ring-black ring-opacity-5"
                          onMouseLeave={() => setMenuOpenPost(null)}
                        >
                          <button
                            onClick={() => handleReport(post._id, saveid)}
                            className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                          >
                            Report
                          </button>
                        </div>
                      )}

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
                                    post.image.length + post.videos.length >
                                      1 ||
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
                                        mediaSrc.match(
                                          /\.(jpeg|jpg|gif|png)$/i
                                        ) ? (
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
                                {post.likes.map((like: any) => (
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
                          onClick={() => handleLike(post._id, saveid)}
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
                                    (like: any) => like._id === saveid
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
                              onClick={() =>
                                setShowEmojiPicker(!showEmojiPicker)
                              }
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
                                handleSendComment(post._id, saveid)
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
                            UpdateLikepost={debouncedGetAllPost}
                            post={post}
                            parentCommentId={comment as string}
                            saveid={saveid}
                            replyingTo={replyingTo}
                            replyContent={replyContent}
                            handleReply={handleReply}
                            setReplyContent={setReplyContent}
                          />
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={index}
                      className="relative mb-8 cursor-pointer p-4 border border-gray-700 rounded-md"
                    >
                      <div className="flex items-center justify-between flex-wrap">
                        <div onClick={() => viewProfile(post.user._id)}>
                          <div className="flex items-center">
                            <img
                              src={
                                post.user.image ? post.user.image : profileimg
                              }
                              alt="Profile"
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="ml-4">
                              <h2 className="text-lg font-semibold">
                                {post.user.name}
                              </h2>
                              <p className="text-md text-green-500  ">
                                {post.category}
                              </p>
                              <small className="text-left text-gray-400  font-normal">
                                {formatTime(post.createdAt)}
                              </small>
                            </div>
                          </div>
                        </div>
                        {post.user._id !== saveid && (
                          <button
                            className="text-gray-400 hover:text-white mt-2 lg:mt-0"
                            onClick={() => handleMenuClick(post._id)}
                          >
                            <MdMoreVert />
                          </button>
                        )}
                      </div>

                      {menuOpenPost === post._id && (
                        <div
                          className="absolute right-4 mt-2 w-40 rounded-md shadow-lg bg-gray-800 text-white ring-1 ring-black ring-opacity-5"
                          onMouseLeave={() => setMenuOpenPost(null)}
                        >
                          <button
                            onClick={() => handleReport(post._id, saveid)}
                            className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                          >
                            Report
                          </button>
                        </div>
                      )}

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
                                    post.image.length + post.videos.length >
                                      1 ||
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
                                        mediaSrc.match(
                                          /\.(jpeg|jpg|gif|png)$/i
                                        ) ? (
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
                                {post.likes.map((like: any) => (
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
                          onClick={() => handleLike(post._id, saveid)}
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
                                    (like: any) => like._id === saveid
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
                              onClick={() =>
                                setShowEmojiPicker(!showEmojiPicker)
                              }
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
                                handleSendComment(post._id, saveid)
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
                            UpdateLikepost={debouncedGetAllPost}
                            post={post}
                            parentCommentId={comment as string}
                            saveid={saveid}
                            replyingTo={replyingTo}
                            replyContent={replyContent}
                            handleReply={handleReply}
                            setReplyContent={setReplyContent}
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              })
            ) : (
              <>
                <div className="relative mb-10 h-[500px] flex flex-col items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Icon with animation */}
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-sm animate-pulse" />
                      <InboxIcon
                        size={48}
                        className="relative text-blue-600 dark:text-blue-400 animate-bounce"
                      />
                    </div>

                    {/* Text content */}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      No Posts Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                      Looks like there aren't any posts yet. Check back later
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          {isLoading && (
            <div className="flex justify-center mt-4">
              <div className="w-9 h-9 border-4 border-solid border-r-transparent border-left-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomeLoginPage;
