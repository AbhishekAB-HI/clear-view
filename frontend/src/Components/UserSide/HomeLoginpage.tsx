import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@mui/material";
import logoWeb from "../animations/Animation - 1724244656671.json";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { store } from "../../Redux-store/reduxstore";
import {
  clearuserAccessTocken,
  setUserAccessTocken,
} from "../../Redux-store/redux-slice";
import { SlLike } from "react-icons/sl";
import { FaComment, FaPaperPlane, FaShare } from "react-icons/fa";
import {
  FaBell,
  FaEnvelope,
  FaHome,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { MdMoreVert, MdOutlinePostAdd } from "react-icons/md";
import profileimg from "../images/Userlogo.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { boolean } from "yup";
import EmojiPicker from "emoji-picker-react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
interface IUser extends Document {
  _id: any;
  name: string | undefined;
  email: string;
  password: string;
  isActive: boolean;
  isAdmin: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  image?: string;
}

interface IPost {
  _id: string;
  user: any;
  description: string;
  image: string;
  videos: string;
  likeCount: number;
  LikeStatement: boolean;
  likes: string[];
  comments: IComment[];
  userName:string
}

interface IComment {
  user: any; // or a more specific type
  content: string;
  userName: string;
  timestamp: Date;
  parentComment: string;
  _id: string;
}

interface ReplyingToState {
  postId: string;
  commentId: string;
}

const HomeLoginPage = () => {
  type RootState = ReturnType<typeof store.getState>;
  const [isOpen, setIsOpen] = useState(false);
  const [Userpost, setPostList] = useState<IPost[]>([]);
  const dispatch = useDispatch();
  const userDetails = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );
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

  useEffect(() => {
    console.log(userDetails, "tocken get...................");

    const getUserId = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/user/userdget/${userDetails}`
        );
        if (data.message === "user id get") {
          setsaveid(data.userId);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getUserId();
  }, [userDetails]);
  useEffect(() => {
    const getAllpost = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/user/getAllpost`
        );
        if (data.message === "getAllpostdetails") {
          setPostList(data.getAlldetails);
          setFilteredPost(data.getAlldetails);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getAllpost();
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
        const {data} = await ClientNew.get(
          "http://localhost:3000/api/user/getreplys"
        );

        if (data.message == "get all reply comments"){
            setReplyPost(data.posts);
            console.log(data.posts,'111111111111111111111111111111');
            
        }
  
      } catch (error) {
        console.log(error);
      }
    };
    getAllreply()
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

  const handleReport = async (postId: string) => {
    const { value: text } = await Swal.fire({
      input: "textarea",
      inputLabel: "Report reason",
      inputPlaceholder: "Type here...",
      inputAttributes: {
        "aria-label": "Type your message here",
      },
      showCancelButton: true,
    });
    if (text) {
      const { data } = await axios.patch(
        "http://localhost:3000/api/user/Reportpost",
        { postId, text },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.message === "Post Reported succesfully") {
        toast.success("Post Reported succesfully");
      }
    } else {
      if (text.length === 0) {
        Swal.fire("Please text here");
      }
      navigate("/homepage");
    }

    console.log("Report post with ID:", postId);

    try {
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  const UpdateLikepost = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/user/getAllpost`
      );
      if (data.message === "getAllpostdetails") {
        setPostList(data.getAlldetails);
        setFilteredPost(data.getAlldetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendComment = async (postId: string, userId: string) => {
    if (comment.length === 0) {
      toast.error("please write something...");
    }

    const { data } = await ClientNew.patch(
      "http://localhost:3000/api/user/CommentPost",
      {
        postId,
        userId,
        comment,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (data.message === "Post Commented succesfully") {
      UpdateLikepost();
      setComment("");
    }
  };


  const handleReplySubmit = async (
    postId: string,
    commentId: string,
    userId: string,
    username:string
  ) => {
    
    setReplyingTo(null);
    const {data} = await ClientNew.post(
      "http://localhost:3000/api/user/replycomment",
      {
        postId,
        commentId,
        replyContent,
        userId,
        username
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if(data.message === "updated succefully"){
    UpdateLikepost();
    setReplyContent("");
    }

  };
  const handleLike = async (postId: string, userId: string) => {
    try {
      console.log(userId, "user id get11111111111111111111");

      const { data } = await axios.patch(
        "http://localhost:3000/api/user/LikePost",
        { postId, userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.message === "Post liked succesfully") {
        UpdateLikepost();
      }
    } catch (error) {
      console.log(error);
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

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="px-4 py-3 shadow-md fixed w-full top-0 left-0 z-50 bg-black">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Lottie animationData={logoWeb} style={{ width: "20%" }} />
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "Viaoda Libre" }}
            >
              Clear View
            </h1>
          </div>
          <form className="flex items-center space-x-2 mr-40">
            <input
              type="search"
              onChange={handleSearch}
              placeholder="Search"
              style={{ width: "300px" }}
              className="bg-gray-800 text-white px-4 py-2 mr-8 rounded-full outline-none"
            />
            <Button style={{ color: "white" }} variant="outlined">
              Search
            </Button>
          </form>

          <div
            className="flex items-center space-x-6 mr-10"
            style={{ fontSize: "18px" }}
          >
            {userDetails ? (
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-25 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  Account
                </button>

                {isOpen && (
                  <div
                    className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5"
                    onMouseLeave={() => setIsOpen(false)}
                  >
                    <div className="py-1">
                      <Link
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                        to="/profile"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex items-center space-x-6 mr-10 pb-10 pt-1"
                style={{ fontSize: "18px" }}
              >
                <button className="hover:underline">
                  <Link to="/login">LogIn</Link>
                </button>
                <span>|</span>
                <button className="hover:underline">
                  <Link to="/register">SignUp</Link>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex mt-20">
        {/* Sidebar */}
        <aside className="w-1/5 p-4 space-y-4 fixed left-20 h-screen overflow-y-auto">
          {/* <div className="flex items-center space-x-2">
            <FaHome style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px", color: "white" }}>
              <Link to="/homepage">Home</Link>
            </span>
          </div> */}
          <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
            <FaHome className="text-[30px] hover:text-[35px]" />
            <span className="text-[20px] hover:text-[22px]">
              <Link to="/homepage">Home</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
            <FaEnvelope className="text-[30px] hover:text-[35px]" />
            <span className="text-[20px] hover:text-[22px]">
              <Link to="/message">Message</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
            <FaUserFriends className="text-[30px] hover:text-[35px]" />
            <span className="text-[20px] hover:text-[22px]">
              <Link to="/followers">Followers</Link>
            </span>
          </div>

          <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
            <FaUserFriends className="text-[30px] hover:text-[35px]" />
            <span className="text-[20px] hover:text-[22px]">
              {" "}
              <Link to="/following">Following</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
            <FaBell className="text-[30px] hover:text-[35px]" />
            <span className="text-[20px] hover:text-[22px]">Notification</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
            <FaUserFriends className="text-[30px] hover:text-[35px]" />
            <span className="text-[20px] hover:text-[22px]">
              {" "}
              <Link to="/people">People</Link>
            </span>
          </div>

          {/* <div className="flex items-center space-x-2">
            <MdOutlinePostAdd style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>
              <Link to="/createpost">Create Post</Link>
            </span>
          </div> */}
        </aside>

        {/* Main Content */}
        <main className="w-4/5 ml-auto p-4">
          {/* Tabs */}
          <div
            style={{ fontSize: "20px", backgroundColor: "black" }}
            className="flex space-x-4  border-black  "
          >
            <button className="pb-2 border-b-2 border-blue-500">
              Latest News
            </button>
            <button className="pb-2">Breaking News</button>
            <button className="pb-2">Sports News</button>
          </div>

          {/* Posts */}
          <div className="mt-10">
            {filteredPost.map((post) => (
              <div
                key={post._id}
                className="relative mb-8 p-4 border border-gray-700 rounded-md"
              >
                <div className="flex items-center justify-between">
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
                    className="text-gray-400 hover:text-white"
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
                      onClick={() => handleReport(post._id)}
                      className="block px-4 py-2 text-sm hover:bg-gray-600 w-full text-left"
                    >
                      Report
                    </button>
                    {/* Add more options here */}
                  </div>
                )}

                <div className="mt-4">
                  {post.image && post.image.length > 0 && (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full rounded-md"
                    />
                  )}{" "}
                  {post.videos && post.videos.length > 0 && (
                    <video controls className="w-full mt-2 rounded-md">
                      <source src={post.videos} type="video/mp4" />
                    </video>
                  )}
                  <div className="mainLikebar flex justify-around mt-4">
                    <div
                      onClick={() => handleLike(post._id, saveid)}
                      className="Likebutton flex  hover: hover:text-blue-600 cursor-pointer  hover:scale-110 transition-transform duration-200"
                    >
                      {" "}
                      <span className="mr-2">{post.likeCount}</span>
                      <SlLike size="25px" color="blue" />
                      {post.likes.includes(saveid) ? (
                        <span
                          style={{ fontWeight: 500 }}
                          className="ml-2 text-blue-600 "
                        >
                          Like
                        </span>
                      ) : (
                        <span className="ml-2">Like</span> // Text for unliked state
                      )}
                    </div>

                    <div
                      onClick={() => handleCommentClick(post._id)}
                      className="Likebutton flex   hover: hover:text-blue-600 cursor-pointer  hover:scale-110 transition-transform duration-200"
                    >
                      <FaComment size="25px" color="blue" />
                      <h1 className="pl-2">Comment</h1>
                    </div>

                    <div className="Likebutton flex  hover: hover:text-blue-600 cursor-pointer  hover:scale-110 transition-transform duration-200">
                      <FaShare size="25px" color="blue" />
                      <h1 className="pl-2">Share</h1>
                    </div>
                  </div>
                  {showCommentBox === post._id && (
                    <div className="mt-10  ">
                      <div className="flex items-center  space-x-2 justify-start">
                        <button
                          className="p-2 bg-blue-600 text-white rounded-md"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          😊
                        </button>
                        <input
                          type="text"
                          className="border p-2 w-full text-black  rounded-md"
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

                      {/* Emoji Picker (optional) */}
                      {showEmojiPicker && (
                        <div className="mt-2">
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}

                      {/* List of Comments */}
                      <div className="mt-4">
                        {post.comments.length > 0 ? (
                          post.comments.map((comment, index) => (
                            <div
                              key={index}
                              className="border-b text-left border-gray-300 py-2 flex items-start"
                            >
                              {/* Display the main comment user's avatar */}

                              {comment && !comment.parentComment && (
                                <img
                                  src={comment.user.image} // Use a default image if not available
                                  alt="User avatar"
                                  className="w-10 h-10 rounded-full mr-4"
                                />
                              )}

                              <div>
                                <p
                                  style={{ fontSize: "15px" }}
                                  className="font-semibold"
                                >
                                  {comment &&
                                    !comment.parentComment &&
                                    comment.user.name}
                                </p>
                                {comment &&
                                  !comment.parentComment &&
                                  comment.content}
                                {comment && !comment.parentComment && (
                                  <small className="text-gray-500">
                                    Posted on:{" "}
                                    <span>
                                      {new Date(
                                        comment.timestamp
                                      ).toLocaleDateString()}
                                    </span>
                                  </small>
                                )}

                                {comment && !comment.parentComment && (
                                  <small
                                    className="ml-2"
                                    style={{ color: "blue" }}
                                  >
                                    <button
                                      onClick={() =>
                                        handleReply(post._id, comment._id)
                                      }
                                    >
                                      Reply
                                    </button>
                                  </small>
                                )}

                                {comment && comment.parentComment && (
                                  <div className="ml-10 mt-2">
                                    <div className="flex items-start mb-2">
                                      <img
                                        src={comment.user.image} // Use a default image if not available
                                        alt="User avatar"
                                        className="w-8 h-8 rounded-full mr-3"
                                      />
                                      <div>
                                        <p className="font-semibold">
                                          <span className="text-blue-600">
                                            {comment.userName}
                                            {"   :  "}
                                          </span>
                                          <span className="text-white">
                                            <span
                                              key={index}
                                              className="text-white"
                                            >
                                              {comment.content}
                                            </span>
                                          </span>
                                        </p>

                                        {comment && comment.parentComment && (
                                          <small className="text-gray-500">
                                            Posted on:{" "}
                                            <span>
                                              {new Date(
                                                comment.timestamp
                                              ).toLocaleDateString()}
                                            </span>
                                          </small>
                                        )}
                                        {comment && comment.parentComment && (
                                          <small
                                            className="ml-2"
                                            style={{ color: "blue" }}
                                          >
                                            <button
                                              onClick={() =>
                                                handleReply(
                                                  post._id,
                                                  comment._id
                                                )
                                              }
                                            >
                                              Reply
                                            </button>
                                          </small>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Reply input area */}
                                {replyingTo?.commentId === comment._id && (
                                  <div className="mt-2 ml-10">
                                    <textarea
                                      className="bg-gray-700 text-white w-full p-2 rounded-md"
                                      value={replyContent}
                                      onChange={(e) =>
                                        setReplyContent(e.target.value)
                                      }
                                      placeholder={`Replying to ${comment.user.name}...`}
                                    />
                                    <button
                                      className="bg-blue-600 text-white px-4 py-1 mt-2 rounded-md"
                                      onClick={() =>
                                        handleReplySubmit(
                                          post._id,
                                          comment._id,
                                          saveid,
                                          comment.user.name
                                        )
                                      }
                                    >
                                      Submit Reply
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>No comments yet.</p>
                        )}
                      </div>
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
