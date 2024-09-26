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

export interface Posts {
  _id: any;
  user: any;
  description: string;
  image: string;
  videos: string;
}

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
  image: string;
}

interface IPost {
  _id: string;
  user: any;
  description: string;
  image: string;
  videos: string;
}

const HomeLoginPage = () => {
  type RootState = ReturnType<typeof store.getState>;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [Userpost, setPostList] = useState<Posts[]>([]);
  const [UserList, setUserList] = useState<IUser>();
  const dispatch = useDispatch();
  const userDetails = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPost, setFilteredPost] = useState<IPost[]>([]);
  const [menuOpenPost, setMenuOpenPost] = useState<string | null>(null);

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
    console.log("Report post with ID:", postId);

    try {
      const { data } = await axios.patch(
        "http://localhost:3000/api/user/Reportpost",
        { postId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.message === "Post Reported succesfully") {
       toast.success("Post Reported succesfully");
      } else {
        alert("Failed to report post");
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      alert("An error occurred while reporting the post");
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
          <div className="flex items-center space-x-2">
            <FaHome style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px", color: "white" }}>
              <Link to="/homepage">Home</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>
              <Link to="/message">Message</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUserFriends style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Followers</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUsers style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Community</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaBell style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Notification</span>
          </div>
          <div className="flex items-center space-x-2">
            <MdOutlinePostAdd style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>
              <Link to="/createpost">Create Post</Link>
            </span>
          </div>
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
            <button className="pb-2">Top News</button>
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
                  {post.image && post.image.length>0 ? (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full rounded-md"
                    />
                  ) : post.videos && post.videos.length>0 ? (
                    <video controls className="w-full mt-2 rounded-md">
                      <source src={post.videos} type="video/mp4" />
                    </video>
                  ) : (
                    <span>No media</span>
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
