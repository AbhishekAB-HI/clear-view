import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "./Navbar";
import Swal from "sweetalert2";
import {
  FaHome,
  FaUsers,
  FaUserFriends,
  FaRegFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearAdminAccessTocken } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import { Button } from "@mui/material";
import { Posts } from "../Interfaces/Interface";
import { API_ADMIN_URL } from "../Constants/Constants";

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const Newsmanagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [getPost, setGetpost] = useState<Posts[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [totalPosts, setTotalPosts] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminTocken = useSelector(
    (state: ReturnType<typeof store.getState>) => state.accessTocken.AdminTocken
  );

  useEffect(() => {
    const getAllPost = async () => {
      try {
        const { data } = await axios.get(
          `${API_ADMIN_URL}/getpost?page=${currentPage}&limit=${postsPerPage}`
        );
        if (data.message === "All posts found") {
          setGetpost(data.data.posts);
          setTotalPosts(data.data.total);
        }else{
          toast.error("Post not found")
        }
      } catch (error) {
     if (axios.isAxiosError(error)) {
       const errorMessage =
         error.response?.data?.message || "An error occurred";
       toast.error(errorMessage);
     } else {
       toast.error("Unknown error occurred");
     }
     console.error("Error during login:", error);
      }
    };

    getAllPost();
  }, [currentPage]);

  
    


    const getAllPost = async () => {
      try {
        const { data } = await axios.get(
          `${API_ADMIN_URL}/getpost?page=${currentPage}&limit=${postsPerPage}`
        );
        if (data.message === "All posts found") {
          setGetpost(data.data.posts);
          setTotalPosts(data.data.total);
        }else{
          toast.error("Post not found")
        }
      } catch (error) {
      if (axios.isAxiosError(error)) {
       const errorMessage =
         error.response?.data?.message || "An error occurred";
       toast.error(errorMessage);
     } else {
       toast.error("Unknown error occurred");
     }
     console.error("Error during login:", error);
      }
      }


  const handleDeletePost = async (id: string,block:boolean) => {
    try {

    const BlockUser =   block ? "Unblock Post" : "Block Post";
      Swal.fire({
        title: "Are you sure ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: BlockUser,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { data } = await axios.delete(
            `${API_ADMIN_URL}/deletepost/${id}`
          );
          if (data.message === "delete post") {
            getAllPost();
           
          }else{
            toast.error("Post delete failed")
          }
        } else {
          navigate("/news");
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
       console.error("Error during login:", error);
    }
  };

  const handleLogout = () => {
    dispatch(clearAdminAccessTocken());
    localStorage.removeItem("admintocken");
    navigate("/Adminlogin");
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);


  return (
    <div>
      <Navbar />
      <div className="flex">
        <aside className="w-64 bg-black text-white p-4 h-screen fixed left-20 top-20">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <FaHome style={{ fontSize: "20px" }} />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers style={{ fontSize: "20px" }} />
              <Link to="/Adminhome">User Management</Link>
            </div>
            <div className="flex items-center space-x-2">
              <FaUserFriends style={{ fontSize: "20px" }} />
              <Link to="/news">News Management</Link>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegFileAlt style={{ fontSize: "20px" }} />
              <Link to="/reportpage">Post Report Management</Link>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegFileAlt style={{ fontSize: "20px" }} />
              <span>
                {" "}
                <Link to="/userReportpage">User Report Management</Link>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaSignOutAlt style={{ fontSize: "20px" }} />
              <button onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </aside>

        <main className="ml-64 flex-1 p-4">
          <div className="container mx-auto">
            <h1 className="flex justify-left mt-10 text-white text-2xl">
              News Management System
            </h1>
            <div className="flex justify-end mb-10">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type here..."
                className="bg-gray-800 text-white px-4 py-2 rounded-l-full w-1/3 outline-none"
              />
            </div>

            <table className="min-w-full bg-gray-700 text-white text-center">
              <thead>
                <tr className="bg-gray-800">
                  <th className="py-3 px-5">No</th>
                  <th className="py-3 px-5">Image</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Block</th>
                </tr>
              </thead>
              <tbody>
                {getPost.map((post, index) => (
                  <tr key={post._id}>
                    <td className="py-2">
                      {index + 1 + (currentPage - 1) * postsPerPage}
                    </td>
                    <td className="py-2">
                      {post.image && post.image.length ? (
                        <img
                          src={post.image}
                          alt="post"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : post.videos && post.videos.length ? (
                        <video controls className="w-20 h-20 rounded-lg">
                          <source src={post.videos} type="video/mp4" />
                        </video>
                      ) : (
                        <span>No media</span>
                      )}
                    </td>
                    <td className="py-2">
                      {truncateText(post.description, 100)}
                    </td>
                    <td className="py-2">
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleDeletePost(post._id, post.BlockPost)
                        }
                        className="text-white px-5 py-1 rounded-full"
                        sx={{
                          backgroundColor: post.BlockPost
                            ? "#006400"
                            : "#FF0000",
                          "&:hover": {
                            backgroundColor: post.BlockPost
                              ? "#00CC00"
                              : "#CC0000", // Adjust hover colors
                          },
                        }}
                      >
                        {post.BlockPost ? "Unblock Post" : "Block Post"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex space-x-2">
                <button
                  className={`text-lg text-blue-500 ${
                    currentPage === 1 && "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`text-lg ${
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
                  className={`text-lg text-blue-500 ${
                    currentPage === totalPages &&
                    "opacity-50 cursor-not-allowed"
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Newsmanagement;
