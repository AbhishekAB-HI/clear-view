import  { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearAdminAccessTocken } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import Swal from "sweetalert2";
import { API_ADMIN_URL } from "../Constants/Constants";
import {  IReportpost } from "../Interfaces/Interface2";
import Adminsidebar from "./Adminsidebar";

const Reportmanagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [getPost, setGetpost] = useState<IReportpost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(2);
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
          `${API_ADMIN_URL}/getreportposts?page=${currentPage}&limit=${postsPerPage}`
        );
        if (data.message === "All posts found") {
          setGetpost(data.data.posts);
          setTotalPosts(data.data.total);
        }else{
          toast.error("Post found fails")
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



  


     const getAllPost = async () => {
       try {
         const { data } = await axios.get(
           `${API_ADMIN_URL}/getreportposts?page=${currentPage}&limit=${postsPerPage}`
         );
         if (data.message === "All posts found") {
           setGetpost(data.data.posts);
           setTotalPosts(data.data.total);
         } else {
           toast.error("Post found fails");
         }
       } catch (error) {
         if (axios.isAxiosError(error)) {
           const errorMessage =
             error.response?.data?.message || "An error occurred";
          console.log(error)
         } else {
               console.log(error);
          //  toast.error("Unknown error occurred");
         }
         console.error("Error during login:", error);
       }
     };

     useEffect(() => {
      getAllPost()
     }, [currentPage]);


    


  const handleDeletePost = async (id: any) => {
    try {

 
      Swal.fire({
        title: "Are you sure?",
        text: "You Want to delete this post",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { data } = await axios.delete(
            `${API_ADMIN_URL}/deleteReportpost/${id}`
          );
          if (data.message === "delete post") {
            toast.success("Post deleted successfully");
              getAllPost();
            setGetpost(getPost.filter((post) => post._id !== id));
            setTotalPosts((prev) => prev - 1);
          }else{
             toast.error("Post delete failed"); 
          }
        } else {
          navigate("/reportpage");
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
        <Adminsidebar />

        <main className="ml-64 flex-1 p-4">
          <div className="container mx-auto">
            <h1 className="flex justify-left mt-10 mb-10 text-white text-2xl">
              News Report Management System
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
                  <th className="py-3 px-5">Posts</th>
                  <th className="py-3 px-3">Report Reason</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Reported by</th>
                  <th className="py-3 px-3">Posted by</th>
                  <th className="py-3 px-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {getPost.length > 0 ? (
                  getPost.map((post, index) => (
                    <tr key={index}>
                      <td className="py-2">
                        {index + 1 + (currentPage - 1) * postsPerPage}
                      </td>
                      <td className="py-2">
                        {post.postId &&
                        post.postimage &&
                        post.postimage.length > 0 ? (
                          <img
                            src={post.postimage} // Ensure you're accessing the correct image
                            alt="post"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : post.postId &&
                          post.postId.videos &&
                          post.postId.videos.length > 0 ? (
                          <video controls className="w-20 h-20 rounded-lg">
                            <source src={post.postId.videos} type="video/mp4" />
                          </video>
                        ) : (
                          <span>No media</span>
                        )}
                      </td>
                      <td className="py-2 text-red-600">{post.postreportReason}</td>
                      <td className="py-2">
                        {post.postId && post.postcontent
                          ? post.postcontent
                          : "No description available"}
                      </td>
                      <td className="py-2">
                        {post.reportedBy && post.reportedBy
                          ? post.reportedBy
                          : "Anonymous"}
                      </td>
                      <td className="py-2">
                        {post.postedBy && post.postedBy
                          ? post.postedBy
                          : "Anonymous"}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => {
                            handleDeletePost(post.postId._id);
                          }}
                          className="bg-red-500 text-white px-5 py-1 rounded-full"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-center text-gray-500" colSpan={6}>
                      No posts available
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

export default Reportmanagement;
