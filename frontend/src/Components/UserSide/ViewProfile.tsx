import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Navigation } from "swiper/modules";
import profileimg from "../images/Userlogo.png";
import Navbar2 from "./Navbar2";
import SideNavBar from "./SideNavbar";
import { useLocation } from "react-router-dom";
import { Heart, Users } from "lucide-react";
import { FaChevronLeft, FaChevronRight, FaComment, FaPaperPlane } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_USER_URL, CONTENT_TYPE_JSON } from "../Constants/Constants";
import toast from "react-hot-toast";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import EmojiPicker from "emoji-picker-react";
import RenderReplies from "./RenderReplies";
import { ReplyingToState } from "../Interfaces/Interface";

const ViewProfilePage = () => {
  const location = useLocation();
  const { userID } = location.state || {};
  const [userData, setuserData] = useState([]);
  const [profileData, setprofileData] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [comment, setComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(4);
    const [totalPosts, setTotalPosts] = useState(0);

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









  const [replyingTo, setReplyingTo] = useState<ReplyingToState | null>(null);
  useEffect(() => {
    const GetUserInfo = async () => {
      try {
        const { data } = await ClientNew.get(
          `${API_USER_URL}/getProfile?userid=${userID}&page=${currentPage}&limit=${postsPerPage}`
        );
        if (data.message === "Get user Profile") {
          setuserData(data.userinfo);
          setprofileData(data.postinfo);
           setTotalPosts(data.totalpost);
        }
      } catch (error) {
        console.log(error);
      }
    };

    GetUserInfo();
  }, []);
  const totalPages = Math.ceil(totalPosts / postsPerPage);

   useEffect(() => {
     GetUserInfo();
   }, [currentPage]);


  const handleReply = (postId: string, commentId: string) => {
    if (replyingTo?.commentId === commentId) {
      setReplyingTo(null);
    } else {
      setReplyingTo({ postId, commentId });
    }
  };

  const GetUserInfo = async () => {
    try {
      const { data } = await ClientNew.get(
        `${API_USER_URL}/getProfile?userid=${userID}&page=${currentPage}&limit=${postsPerPage}`
      );
      if (data.message === "Get user Profile") {
        setuserData(data.userinfo);
        setprofileData(data.postinfo);
         setTotalPosts(data.totalpost);
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
        GetUserInfo();
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

  // const userData = location.state?.UserData;
  const [showLikesList, setShowLikesList] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(null);

  const handleCommentClick = (postId: any) => {
    if (showCommentBox === postId) {
      setShowCommentBox(null);
    } else {
      setShowCommentBox(postId);
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
        GetUserInfo();
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
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />

      <div className="flex mt-20">
        <SideNavBar />
        <main className="w-full md:w-4/5 ml-auto p-4">
          <div
            style={{ fontSize: "20px" }}
            className="flex w-full md:w-4/5 ml-auto mt-10 space-x-5 md:space-x-10 mb-4 text-green  fixed top-20 pt-3 bg-black z-40"
          >
            <h1 className="mb-2 mt-5" style={{ fontSize: "25px" }}>
              Profile page
            </h1>
          </div>

          {/* Posts */}
          <div className="mt-5">
            <div className="max-w-screen-lg mx-auto bg-black text-white rounded-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start mt-10">
                {userData ? (
                  <div className="flex flex-col md:flex-row items-center">
                    <img
                      src={userData.image ? userData.image : profileimg}
                      alt="Profile"
                      className="w-20 h-20 md:w-32 md:h-32 rounded-full mr-6"
                    />
                    <div className="text-left mt-4 md:mt-0">
                      <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                        {userData.name}
                      </h2>
                      <p className="text-gray-400 text-sm md:text-base">
                        {userData.email}
                      </p>
                      <p className="text-gray-400 text-sm md:text-base">
                        Joined:{" "}
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm md:text-base">
                        Following: {userData.following?.length || 0} <br />
                        Followers: {userData.followers?.length || 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Loading profile...</p>
                )}
              </div>

              <div className="mt-10   flex flex-col md:flex-row justify-between items-center">
                <div className="flex gap-10 md:gap-20 text-center md:text-left">
                  <h1
                    style={{ fontSize: "25px", fontWeight: "bold" }}
                    className="cursor-pointer"
                  >
                    Posts
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            {profileData.map((post: any) => (
              <div key={post._id} className="mb-4">
                <div className="flex justify-between items-center space-x-4">
                  {/* Profile Information */}
                  <div className="flex items-center space-x-4">
                    {userData && (
                      <img
                        src={userData.image ? userData.image : profileimg}
                        alt="image"
                        className="rounded-full w-8 h-8 md:w-10 md:h-10"
                      />
                    )}
                    {userData && (
                      <span className="font-semibold text-sm md:text-base">
                        {userData.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="mt-2 text-left text-sm md:text-lg py-5">
                    {post.description}
                  </p>
                  {post.image && post.image.length > 0 && (
                    <Swiper
                      modules={[Pagination, Navigation]}
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation={
                        post.image && post.image.length > 1
                          ? {
                              nextEl: ".swiper-button-next-image",
                              prevEl: ".swiper-button-prev-image",
                            }
                          : false
                      }
                      pagination={{ clickable: true }}
                      className="w-full h-80 relative"
                    >
                      {post.image &&
                        post.image.slice(0, 4).map((imageSrc, index) => (
                          <SwiperSlide key={index}>
                            <img
                              src={imageSrc}
                              alt={`post-image-${index}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </SwiperSlide>
                        ))}

                      {post.image && post.image.length > 1 && (
                        <>
                          <button className="swiper-button-prev-image absolute top-1/2 left-4 transform -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 rounded-full p-2">
                            &#8592;
                          </button>
                          <button className="swiper-button-next-image absolute top-1/2 right-4 transform -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 rounded-full p-2">
                            &#8594;
                          </button>
                        </>
                      )}
                    </Swiper>
                  )}

                  {/* Video Slider */}
                  {post.videos && post.videos.length > 0 && (
                    <Swiper
                      modules={[Pagination, Navigation]}
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation={
                        post.videos.length > 1
                          ? {
                              nextEl: ".swiper-button-next-video",
                              prevEl: ".swiper-button-prev-video",
                            }
                          : false
                      }
                      pagination={{ clickable: true }}
                      className="w-full h-80 relative mt-0"
                    >
                      {post.videos.map((videoSrc, index) => (
                        <SwiperSlide key={index}>
                          <video
                            controls
                            className="w-full h-full object-cover rounded-lg"
                            autoPlay={false}
                            muted={false}
                          >
                            <source src={videoSrc} type="video/mp4" />
                          </video>
                        </SwiperSlide>
                      ))}

                      {post.videos.length > 1 && (
                        <>
                          <button className="swiper-button-prev-video absolute top-1/2 left-4 transform -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 rounded-full p-2">
                            &#8592;
                          </button>
                          <button className="swiper-button-next-video absolute top-1/2 right-4 transform -translate-y-1/2 z-10 text-white bg-black bg-opacity-50 rounded-full p-2">
                            &#8594;
                          </button>
                        </>
                      )}
                    </Swiper>
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
                    onClick={() => handleLike(post._id, userData?._id)}
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
                              (like) => like._id === userData?._id
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
                        onClick={() => handleSendComment(post._id, userID)}
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
                      UpdateLikepost={GetUserInfo}
                      post={post}
                      parentCommentId={comment._id}
                      saveid={userID}
                      replyingTo={replyingTo}
                      replyContent={replyContent}
                      handleReply={handleReply}
                      setReplyContent={setReplyContent}
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-center items-center space-x-4 p-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewProfilePage;