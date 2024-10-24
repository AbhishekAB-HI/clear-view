import React, { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { store } from "../../Redux-store/Reduxstore";
import { clearuserAccessTocken } from "../../Redux-store/Redux-slice";
import {
  FaEdit,
} from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import profileimg from "../images/Userlogo.png";
import EditProfileModal from "./EditProfile";
import Postpage from "./Addpost";
import EditPostModal from "./EditPostPage";
import Clintnew from "../../Redux-store/Axiosinterceptor";
import SideBar2 from "./Sidebar2";
import Navbar2 from "./Navbar2";
import { IUser } from "../AdminSide/UserReportPage";
import { IPost } from "../Interfaces/Interface";
import { API_USER_URL } from "../Constants/Constants";
const HomeProfilepage = () => {

  type RootState = ReturnType<typeof store.getState>;
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [profileInfo, setprofileInfo] = useState<IUser | null>(null);
  const [showModal, setShowModal] = useState(false);
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
  const navigate = useNavigate();

  useEffect(() => {
    const getUserinfo = async () => {
      try {
          const { data } = await Clintnew.get(`${API_USER_URL}/getUserinfo`);
          if (data.message === "get User data") {
            setuserinfo(data.userDetails);
          }else{
            toast.error("No user found")
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
        }else{
          toast.error("User Profile Not found");
        }


        const response = await Clintnew.get(`${API_USER_URL}/userposts`);
        if (response.data.message === "User Post found") {
          setuserPost(response.data.getdetails);
          setFilteredPost(response.data.getdetails);
        }else{
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
      }else{
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
      const response = await Clintnew.get(`${API_USER_URL}/userposts`);
      if (response.data.message === "User Post found") {
        setuserPost(response.data.getdetails);
        setFilteredPost(response.data.getdetails);
      }else{
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
            Swal.fire({
              title: "Deleted!",
              text: "Your post and associated image have been deleted.",
              icon: "success",
            });
            fetchdatas();
            if (filteredPost.length === 1) {
              window.location.reload();
            }
          }else{
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
      <Navbar2 />
     
      {/* Modal started---------------------------------------------------------------------- */}

      {/* Modal end---------------------------------------------------------------------- */}

      <div className="flex mt-20">
        {/* Sidebar */}
        <SideBar2 />
       

        {/* Main Content */}
        <main className="w-full md:w-4/5 ml-auto p-4">
          {/* Tabs */}
          <div
            style={{ fontSize: "20px" }}
            className="flex w-full md:w-4/5 ml-auto mt-10 space-x-5 md:space-x-10 mb-4 text-green border-b border-gray-700 fixed top-20 pt-3 bg-black z-40"
          >
            <h1 className="mb-5" style={{ fontSize: "25px" }}>
              Profile page
            </h1>
          </div>

          {/* Posts */}
          <div className="mt-0">
            <div className="max-w-screen-lg mx-auto bg-black text-white rounded-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                {profileInfo ? (
                  <div className="flex flex-col md:flex-row items-center mt-10">
                    <img
                      src={profileInfo.image ? profileInfo.image : profileimg}
                      alt="Profile"
                      className="w-20 h-20 md:w-32 md:h-32 rounded-full mr-6"
                    />
                    <div className="text-left mt-4 md:mt-0">
                      <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                        {profileInfo.name}
                      </h2>
                      <p className="text-gray-400 text-sm md:text-base">
                        {profileInfo.email}
                      </p>
                      <p className="text-gray-400 text-sm md:text-base">
                        Joined:{" "}
                        {new Date(profileInfo.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm md:text-base">
                        <p>Following: {userinfo.following?.length || 0}</p>
                        <p>Followers: {userinfo.followers?.length || 0}</p>
                        {/* 15 Following 0 Followers */}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Loading profile...</p>
                )}

                {profileInfo && (
                  <button
                    onClick={() => handleEditClick(profileInfo._id)}
                    className="flex items-center bg-transparent text-white border border-white rounded-full px-4 py-2 hover:bg-gray-700 mt-5 md:mt-0"
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

              <div className="mt-10 flex flex-col md:flex-row justify-between items-center">
                <div className="flex gap-10 md:gap-20 text-center md:text-left">
                  <span className="cursor-pointer">Posts</span>
                  <span className="cursor-pointer">Followers</span>
                  <span className="cursor-pointer">Likes</span>
                  <span className="cursor-pointer">Saved</span>
                  <span className="cursor-pointer">Share</span>
                </div>
                {profileInfo && (
                  <button
                    onClick={() => handlepostClick(profileInfo._id)}
                    className="bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600 mt-5 md:mt-0"
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
                  <p className="mt-2 text-left text-sm md:text-lg py-5">
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
                  {/* Likes, comments, and shares */}
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
