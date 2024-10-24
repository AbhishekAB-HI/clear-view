import { ChangeEvent, useEffect, useState } from "react";
import logoWeb from "../animations/Animation - 1724244656671.json";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { store } from "../../Redux-store/Reduxstore";
import { clearuserAccessTocken } from "../../Redux-store/Redux-slice";
import { SlLike } from "react-icons/sl";
import {FaBell, FaComment,FaPaperPlane,FaUserCircle} from "react-icons/fa";
import { MdMoreVert } from "react-icons/md";
import profileimg from "../images/Userlogo.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import EmojiPicker from "emoji-picker-react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import RenderReplies from "./RenderReplies";
import { AiOutlineSearch } from "react-icons/ai";
import SideBar from "./SideBar";
import { API_CHAT_URL, API_USER_URL, CONTENT_TYPE_JSON } from "../Constants/Constants";
import { IPost, Notification, ReplyingToState } from "../Interfaces/Interface";


const HomeLoginPage = () => {
  type RootState = ReturnType<typeof store.getState>;
  // STATE_MANAGEMENT===============================================================================================================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [Userpost, setPostList] = useState<IPost[]>([]);
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
  const [replyPost, setReplyPost] = useState<IPost[]>([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [AccOpen, setAccOpen] = useState(false);
 const [SaveAllNotifications, setSaveAllNotifications] = useState<Notification[]>([]);
  // STATE_MANAGEMENT===============================================================================================================================================================

  const userDetails = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );

  // API ====================================================================================================================================================

    useEffect(() => {
      const getNotifications = async () => {
        try {
          const { data } = await ClientNew.get(
            `${API_CHAT_URL}/getnotifications`
          );
          if (data.message === "get all notifications") {
            console.log(
              data.notifications,
              "00000000000000000000000000000000000000000"
            );

            setSaveAllNotifications(data.notifications);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getNotifications();
    }, []);


  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data } = await axios.get(`${API_USER_URL}/userdget/${userDetails}`);
        if (data.message === "user id get") {
          setsaveid(data.userId);
        }else{
           toast.error("Failed to retrieve userid.");
        }
      } catch (error:unknown) {
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

    getUserId();
  }, [userDetails]);


  useEffect(() => {
    const getAllPost = async () => {
      try {
        const { data } = await axios.get(`${API_USER_URL}/getAllpost`);
        if (data.message === "getAllpostdetails") {
          setPostList(data.getAlldetails);
          setFilteredPost(data.getAlldetails);
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
      }
    };
    getAllPost();
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

  useEffect(() => {
    const getAllreply = async () => {
      try {
        const { data } = await ClientNew.get(`${API_USER_URL}/getreplys`);
        if (data.message === "get all reply comments") {
          setReplyPost(data.posts);
        }else{
           toast.error("Failed to get the reply comment");
        }
      } catch (error:unknown) {
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
    getAllreply();
  }, []);

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setComment((prevComment) => prevComment + emojiData.emoji);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      dispatch(clearuserAccessTocken());
      localStorage.removeItem("usertocken");
      navigate("/homepage");
    } catch (error) {
      console.log(error);
    }
  };

  const handleMenuClick = (postId: string) => {
    setMenuOpenPost(menuOpenPost === postId ? null : postId);
  };


  const handleReport = async (postId: string,userId:string) => {
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
          const { data } = await axios.patch(
            `${API_USER_URL}/Reportpost`,
            { postId, text, userId },
            {
              headers: {
                "Content-Type": CONTENT_TYPE_JSON,
              },
            }
          );
          if (data.message === "Post Reported succesfully") {
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


  const UpdateLikepost = async () => {
    try {
      const { data } = await axios.get(`${API_USER_URL}/getAllpost`);
      if (data.message === "getAllpostdetails") {
        setPostList(data.getAlldetails);
        setFilteredPost(data.getAlldetails);
      }else{
        toast.error("Failed get all post"); 
      }
    } catch (error:unknown) {
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

  const handleSendComment = async (postId: string, userId: string) => {
    try {
       if (comment.length === 0) {
      toast.error("please write something...");
    }
    const { data } = await ClientNew.patch(`${API_USER_URL}/CommentPost`,
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
      UpdateLikepost();
      setComment("");
      setShowEmojiPicker(false)
    }else{
       toast.error("Post Commented Failed");
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

  const handleLike = async (postId: string, userId: string) => {
    try {
      const { data } = await axios.patch(`${API_USER_URL}/LikePost`,
        { postId, userId },
        {
          headers: {
            "Content-Type": CONTENT_TYPE_JSON,
          },
        }
      );
      if (data.message === "Post liked succesfully") {
        UpdateLikepost();
      }else{
        toast.error("Post liked Failed");
      }
    } catch (error:unknown) {
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

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query === "") {
      setFilteredPost(Userpost);
    } else {
      const filtered = Userpost.filter((user) =>
        user.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPost(filtered);
    }
  };

  // API ====================================================================================================================================================

  // PAGE VIEW =================================================================================================================================================================
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navbar----------------------------------------------------------------------- */}
      <nav className="fixed w-full top-0 left-0 z-50 bg-black border-b border-gray-700">
        <div className="px-4 py-3 pb-20 shadow-md">
          {/* Logo and Site Name */}
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Lottie
                animationData={logoWeb}
                className="w-12 sm:w-16 md:w-20" // Responsive sizing for logo
              />
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: "Viaoda Libre" }}
              >
                Clear View
              </h1>
            </div>

            {/* Desktop Search Form */}
            <form className="hidden lg:flex items-center space-x-2">
              <input
                type="search"
                onChange={handleSearch}
                placeholder="Search"
                className="bg-gray-800 text-white px-5 py-1 rounded-full outline-none w-full sm:w-64 md:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" // Enhanced styling
              />
            </form>

            {/* Account Dropdown */}
            <div className="flex items-center space-x-4 md:space-x-6 lg:mr-10 text-white text-base md:text-lg">
              <div className="relative inline-block">
                {/* Bell Icon */}
                <FaBell className="text-[20px] hover:text-[22px] hover:cursor-pointer" />

                {/* Notification Count */}
                {SaveAllNotifications && SaveAllNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {SaveAllNotifications.length}
                  </span>
                )}
              </div>
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

      <div className="flex mt-0">
        {/* Sidebar --------------------------------------------------------------------- */}
        <SideBar />
        {/* Sidebar --------------------------------------------------------------------- */}
        {/* Main Content */}
        <main className="w-full  lg:w-4/5 ml-auto p-4">
          {/* Tabs */}
          <div
            style={{ fontSize: "16px" }}
            className="fixed top-20 left-50 w-full z-50 bg-black text-white overflow-x-auto px-4 p-5 flex items-center justify-start space-x-4 lg:space-x-10"
          >
            <button className="pb-2 border-b-2 border-blue-500">
              Latest News
            </button>
            <button className="pb-2">Breaking News</button>
            <button className="pb-2">Sports News</button>
          </div>

          {/* Posts */}
          <div className="mt-24 ">
            {filteredPost.map((post) => (
              <div
                key={post._id}
                className="relative mb-8 p-4 border border-gray-700 rounded-md"
              >
                <div className="flex items-center justify-between flex-wrap">
                  <div className="flex items-center">
                    <img
                      src={post.user.image ? post.user.image : profileimg}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold">
                        {post.user.name}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {post.description}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white mt-2 lg:mt-0"
                    onClick={() => handleMenuClick(post._id)}
                  >
                    <MdMoreVert />
                  </button>
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

                <div className="mt-4 ">
                  <div className="lg:p-20  sm:p-5 md:p-10">
                    {post.image && post.image.length > 0 && (
                      <img
                        src={post.image}
                        alt="post"
                        className="w-full rounded-md object-cover"
                      />
                    )}

                    {post.videos && post.videos.length > 0 && (
                      <video controls className="w-full mt-2 rounded-md">
                        <source src={post.videos} type="video/mp4" />
                      </video>
                    )}
                  </div>

                  <div className="mainLikebar flex justify-around mt-4 text-sm sm:text-base">
                    <div
                      onClick={() => handleLike(post._id, saveid)}
                      className="Likebutton flex hover:text-blue-600 cursor-pointer hover:scale-110 transition-transform duration-200"
                    >
                      <span className="mr-2">{post.likeCount}</span>
                      <SlLike size="20px" color="blue" />
                      <span className="ml-2">
                        {post.likes.includes(saveid) ? (
                          <span className="text-blue-600">Like</span>
                        ) : (
                          <span>Like</span>
                        )}
                      </span>
                    </div>

                    <div
                      onClick={() => handleCommentClick(post._id)}
                      className="Likebutton flex hover:text-blue-600 cursor-pointer hover:scale-110 transition-transform duration-200"
                    >
                      <span className="mr-2">{post.comments.length}</span>
                      <FaComment size="20px" color="blue" />

                      <h1 className="pl-2">Comment</h1>
                    </div>

                    {/* <div className="Likebutton flex hover:text-blue-600 cursor-pointer hover:scale-110 transition-transform duration-200">
                      <FaShare size="20px" color="blue" />
                      <h1 className="pl-2">Share</h1>
                    </div> */}
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
                          onClick={() => handleSendComment(post._id, saveid)}
                        >
                          <FaPaperPlane />
                        </button>
                      </div>

                      {showEmojiPicker && (
                        <div className="mt-2">
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}

                      <div className="mt-4">
                        {post.comments.length > 0 ? (
                          post.comments
                            .filter((comment) => !comment.parentComment)
                            .map((comment, index) => (
                              <div
                                key={index}
                                className="border-b text-left border-gray-300 py-2 flex items-start"
                              >
                                <div></div>
                              </div>
                            ))
                        ) : (
                          <p>No comments yet.</p>
                        )}
                      </div>
                      <RenderReplies
                        UpdateLikepost={UpdateLikepost}
                        post={post}
                        parentCommentId={comment._id}
                        saveid={saveid}
                        replyingTo={replyingTo}
                        replyContent={replyContent}
                        handleReply={handleReply}
                        setReplyContent={setReplyContent}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeLoginPage;
