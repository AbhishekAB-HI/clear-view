import  { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "./Navbar";
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
import Swal from "sweetalert2";
import { IUser } from "../Interfaces/Interface";
import { API_ADMIN_URL } from "../Constants/Constants";
import Adminsidebar from "./Adminsidebar";

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const UserReportmanagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [getPost, setGetpost] = useState<IUser[]>([]);
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
        const { data } = await axios.get(`${API_ADMIN_URL}/getreportusers`);
        if (data.message === "All user found") {
          setGetpost(data.foundusers);
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
          console.error("Error during login:", error);
      }
    };

    getAllPost();
     
  }, [currentPage]);


  

  const handleDeletePost = async (id: string) => {
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
            <h1 className="flex justify-left mb-10 mt-10 text-white text-2xl">
              User Report Management System
            </h1>
            {/* <div className="flex justify-end mb-10">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type here..."
                className="bg-gray-800 text-white px-4 py-2 rounded-l-full w-1/3 outline-none"
              />
            </div> */}

            <table className="min-w-full bg-gray-700 text-white text-center">
              <thead>
                <tr className="bg-gray-800">
                  <th className="py-3 px-5">No</th>
                  <th className="py-3 px-5">Image</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Report Reason</th>

                  <th className="py-3 px-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {getPost?.length > 0 ? (
                  getPost?.map((post, index) => (
                    <tr key={index}>
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">
                        {post.reportedUser?.image &&
                        post.reportedUser?.image.length > 0 ? (
                          <img
                            src={post.reportedUser?.image}
                            alt="post"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <span>No media</span>
                        )}
                      </td>
                      <td className="py-2 ">{post.reportedUser?.name}</td>
                      <td className="py-2 text-red-600">
                        {truncateText(post.reportReason, 100)}
                      </td>

                      <td className="py-2">
                        <button
                          onClick={() => handleDeletePost(post._id)}
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

export default UserReportmanagement;
