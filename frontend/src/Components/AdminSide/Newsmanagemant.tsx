import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "./Navbar";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearAdminAccessTocken } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import { Button } from "@mui/material";
import { IPost } from "../Interfaces/Interface";
import { API_ADMIN_URL } from "../Constants/Constants";
import Adminsidebar from "./Adminsidebar";
import { Users2Icon } from "lucide-react";

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const Newsmanagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [getPost, setGetpost] = useState<IPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [totalPosts, setTotalPosts] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminTocken = useSelector((state: ReturnType<typeof store.getState>) => state.accessTocken.AdminTocken);

  useEffect(() => {
    const getAllPost = async () => {
      try {
        const { data } = await axios.get(`${API_ADMIN_URL}/getposts?page=${currentPage}&limit=${postsPerPage}&search=${searchTerm}`);
        if (data.message === "All posts found") {
          setGetpost(data.data.posts);
          setTotalPosts(data.data.total);
        } else {
          toast.error("Post not found");
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
  }, []);

  useEffect(() => {
    getAllPost();
  }, [searchTerm, currentPage]);

 
    


  const getAllPost = async () => {
    try {
      const { data } = await axios.get(
        `${API_ADMIN_URL}/getposts?page=${currentPage}&limit=${postsPerPage}&search=${searchTerm}`
      );
      if (data.message === "All posts found") {
        setGetpost(data.data.posts);
        setTotalPosts(data.data.total);
      } else {
        toast.error("Post not found");
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

    const totalPages = Math.ceil(totalPosts / postsPerPage);
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Adminsidebar />

        <main className="ml-60  w-3/5 flex-1 p-4">
          <div className="container mx-auto">
            <h1 className="flex justify-left mt-10 text-white text-2xl">
              News Management System
            </h1>
            <div className="flex justify-end mb-10">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                  <th className="py-3 px-3">Posted By</th>
                  <th className="py-3 px-3">Block</th>
                </tr>
              </thead>
              <tbody>
                {getPost && getPost.length > 0 ? (
                  getPost.map((post, index) => (
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
                      <td className="py-2">{post?.user?.name}</td>
                      <td className="py-2">
                        <Button
                          variant="contained"
                          onClick={() =>
                            handleDeletePost(post._id, post?.BlockPost)
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="relative mb-10 h-[500px] flex flex-col items-center justify-center p-8 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-sm animate-pulse" />
                            <Users2Icon
                              size={48}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            No  Posts
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                            Looks like there aren't any notifications or posts
                            yet. Check back later.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
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
