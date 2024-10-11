import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@mui/material";
import logoWeb from "../animations/Animation - 1724244656671.json";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { store } from "../../Redux-store/reduxstore";
import { clearuserAccessTocken } from "../../Redux-store/redux-slice";
import {
  FaBell,
  FaEdit,
  FaEnvelope,
  FaHome,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";

import { MdOutlinePostAdd } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import profileimg from "../images/Userlogo.png";
import EditProfileModal from "./EditProfile";
import Postpage from "./Addpost";
import EditPostModal from "./EditpostPage";
import Clintnew from "../../Redux-store/Axiosinterceptor";
const HomeProfilepage = () => {
  interface IUser {
    _id: any;
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    isAdmin: boolean;
    isVerified?: boolean;
    createdAt?: any;
    updatedAt?: Date;
    image: string;
    otp?: number;
  }

  interface IPost {
    _id:string
    user: string;
    description: string;
    image: string;
    videos: string;
  }
  type RootState = ReturnType<typeof store.getState>;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [profileInfo, setprofileInfo] = useState<IUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showpostModal, setShowpostModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [UserId, setUserId] = useState<string | null>(null);
  const [userPost, setuserPost] = useState<IPost[]>([]);
  // const [menuOpen, setMenuOpen] = useState(false);
   const [menuOpen, setMenuOpen] = useState(null);
  const [editpostUserId, seteditpostUserId] = useState<string | null>(null);
  const [postid, setPostid] = useState<string | null>(null);
  const [ShoweditpostModal,setShoweditpostModal] = useState(false)

   const [searchQuery, setSearchQuery] = useState("");
   const [filteredPost, setFilteredPost] = useState<IPost[]>([]);


 const navigate = useNavigate();

  // const toggleMenu = () => {
  //   setMenuOpen(!menuOpen);
  // };

const toggleMenu = (postId:any) => {
  if (menuOpen === postId) {
    setMenuOpen(null); 
  } else {
    setMenuOpen(postId); 
  }
};
 

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const togglepostModal = () => {
    setShowpostModal(!showpostModal);
  };


   const toggleeditpostModal= ()=>{
     setShoweditpostModal(!ShoweditpostModal);
   }

  const handleEditClick = (id: string) => {
    setSelectedUserId(id);
    setShowModal(true);
  };

  const handlepostClick = (id: string) => {
    setUserId(id);
    setShowpostModal(true);
  };

  const handleeditpostClick = (postid:string) => {
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
        const { data } = await Clintnew.get(
          "http://localhost:3000/api/user/userprofile"
        );
        if (data.message === "User Profile found") {
          setprofileInfo(data.getdetails);
         
        }
          const response = await Clintnew.get(
            "http://localhost:3000/api/user/userposts"
          );
        if (response.data.message === "User Post found") {
          setuserPost(response.data.getdetails);
           setFilteredPost(response.data.getdetails);
        }
      } catch (error) {
        console.log(error);
       
      }
    };
    fetchdata();
  }, []);

  const fetchProfiledata = async () => {
    try {
      const { data } = await Clintnew.get(
        "http://localhost:3000/api/user/userprofile"
      );
      if (data.message === "User Profile found") {
        setprofileInfo(data.getdetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfileState = () => {
    fetchProfiledata();
  };

  const updateState = () =>{
    fetchdatas()
  }


  


  const fetchdatas = async () => {
    try {
     
      const response = await Clintnew.get(
        "http://localhost:3000/api/user/userposts"
      );
      if (response.data.message === "User Post found") {
        setuserPost(response.data.getdetails);
        setFilteredPost(response.data.getdetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
              `http://localhost:3000/api/user/deletepost/${id}`
            );

            if (response.data.message === "Post deleted successfully") {
              toast.success("Post deleted successfully");
              Swal.fire({
                title: "Deleted!",
                text: "Your post and associated image have been deleted.",
                icon: "success",
              });
              fetchdatas();
              if (filteredPost.length === 1) {
                window.location.reload();
              }
            }
          } else {
            fetchdatas();
          }
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      }
    };


 

  const handleLogout = async () => {
    try {
      dispatch(clearuserAccessTocken());
      localStorage.removeItem("usertocken");
      navigate("/homepage");
    } catch (error) {
      console.log(error);
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
            className="flex items-center space-x-6 mr-10 "
            style={{ fontSize: "18px" }}
          >
            {usertocken ? (
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
                        {" "}
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
      {/* Modal started---------------------------------------------------------------------- */}

      {/* Modal end---------------------------------------------------------------------- */}

      <div className="flex mt-20">
        {/* Sidebar */}
        <aside className="w-1/5 p-4 space-y-4 fixed left-20 h-screen overflow-y-auto">
          <div className="flex items-center space-x-2 ">
            <FaHome style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px", color: "white" }}>
              {" "}
              <Link to="/homepage">Home</Link>{" "}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Message</span>
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
              <Link to="/createpost">createpost</Link>{" "}
            </span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-4/5 ml-auto p-4">
          {/* Tabs */}
          <div
            style={{ fontSize: "20px" }}
            className="flex w-4/5 ml-auto  space-x-10 mb-4 text-green   border-b border-gray-700 fixed top-20 pt-3  bg-black z-40"
          >
            <h1 className="mb-5" style={{ fontSize: "25px" }}>
              Profile page
            </h1>
          </div>

          {/* Posts */}
          <div className="mt-0">
            <div className="max-w-screen-2xl  mx-auto bg-black text-white rounded-lg p-6">
              <div className="flex justify-between items-center">
                {profileInfo ? (
                  <div className="flex items-center mt-10">
                    <img
                      src={profileInfo.image ? profileInfo.image : profileimg}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mr-6"
                    />
                    <div className="text-left">
                      <h2 className="text-2xl  font-semibold mb-3">
                        {profileInfo.name}
                      </h2>
                      <p className="text-gray-400">{profileInfo.email}</p>
                      <p className="text-gray-400">
                        Joined:{" "}
                        {new Date(profileInfo.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400">15 Following 0 Followers</p>
                    </div>
                  </div>
                ) : (
                  <p>Loading profile...</p>
                )}

                {profileInfo && (
                  <button
                    onClick={() => handleEditClick(profileInfo._id)}
                    className="flex items-center bg-transparent text-white border border-white rounded-full px-4 py-2 hover:bg-gray-700"
                  >
                    <FaEdit className="mr-2" />
                    Edit profile
                  </button>
                )}
              </div>
              {showModal && (
                <EditProfileModal
                  updateProfileState={updateProfileState}
                  toggleModal={toggleModal}
                  userid={selectedUserId}
                />
              )}

              <div className="mt-10 flex justify-between items-center">
                <div className="flex gap-20">
                  <span className="cursor-pointer">Posts</span>
                  <span className="cursor-pointer">Followers</span>
                  <span className="cursor-pointer">Likes</span>
                  <span className="cursor-pointer">Saved</span>
                  <span className="cursor-pointer">Share</span>
                </div>
                {profileInfo && (
                  <button
                    onClick={() => handlepostClick(profileInfo._id)}
                    className="bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600"
                  >
                    Create post
                  </button>
                )}
                {showpostModal && (
                  <Postpage
                    togglepostModal={togglepostModal}
                    updateState={updateState}
                    userid={UserId}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="mt-5">
            {filteredPost.map((post) => (
              <div key={post._id} className="mb-4">
                <div className="flex justify-between items-center space-x-4">
                  {/* Profile Information */}
                  <div className="flex items-center space-x-4">
                    {profileInfo && (
                      <img
                        src={profileInfo.image ? profileInfo.image : profileimg}
                        alt="image"
                        className="rounded-full w-10 h-10"
                      />
                    )}
                    {profileInfo && (
                      <span className="font-semibold">{profileInfo.name}</span>
                    )}
                  </div>

                  {/* Three-Dot Menu */}
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(post._id)}
                      className="text-gray-100 hover:text-gray-500"
                      style={{ marginLeft: "100px" }}
                    >
                      &#x22EE; {/* This is the vertical three-dot symbol */}
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen === post._id && ( // Only open the menu for the clicked post
                      <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            handleeditpostClick(post._id);
                          }}
                          className="block w-full text-left font-medium px-4 py-2 text-black hover:text-blue-500"
                        >
                          Edit
                        </button>
                        {ShoweditpostModal && (
                          <EditPostModal
                            toggleeditpostModal={toggleeditpostModal}
                            postid={postid}
                            updateState={updateState}
                          />
                        )}

                        <button
                          onClick={() => {
                            handleDeletepost(post._id);
                            setMenuOpen(null); // Close the menu after deletion
                          }}
                          className="block w-full text-left font-medium px-4 py-2 text-black hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <p className="mt-2 text-left text-lg py-5">
                    {post.description}
                  </p>

                  {/* Conditionally render image, video, or both */}
                  {post.image && post.image.length > 0 && (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  )}

                  {post.videos && post.videos.length > 0 && (
                    <video
                      controls
                      className="w-full rounded-lg"
                      autoPlay
                      muted={false}
                    >
                      <source src={post.videos} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                <div className="flex space-x-4 mt-2 text-gray-400">
                  {/* <span>{post.likes} Likes</span>
                        <span>{post.comments} Comments</span>
                        <span>{post.shares} Shares</span> */}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeProfilepage;
