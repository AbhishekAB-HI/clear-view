import  { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {FaHome,FaUsers,FaUserFriends,FaRegFileAlt,FaSignOutAlt,FaRegUser} from "react-icons/fa";
import Navbar from "./Navbar";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearAdminAccessTocken } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { IUser } from "../Interfaces/Interface";
import { API_ADMIN_URL, CONTENT_TYPE_JSON } from "../Constants/Constants";
import Adminsidebar from "./Adminsidebar";
import { Home, Users } from "lucide-react";
const AdminHomePage = () => {
 
  const [searchTerm, setSearchTerm] = useState("");
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [countPosts,setCountpost] =useState(0)
  const [itemsPerPage] = useState(5); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminTocken = useSelector(
    (state: ReturnType<typeof store.getState>) => state.accessTocken.AdminTocken
  );

  useEffect(() => {
    const FetchUserdetails = async () => {
      try {
        const { data } = await axios.get(
          `${API_ADMIN_URL}/admindashboard?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`
        );
        if (data.message === "user data get succesfull") {
          setUsersList(data.userinfo);
          setCountpost(data.userscount);
        }else{
          toast.error("No data found")
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
    FetchUserdetails();
  }, []);

   useEffect(() => {
     FetchUserdetails();
   }, [currentPage,searchTerm]);

    const FetchUserdetails = async () => {
      try {
        const { data } = await axios.get(
          `${API_ADMIN_URL}/admindashboard?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`
        );
        if (data.message === "user data get succesfull") {
          setUsersList(data.userinfo);
          setCountpost(data.userscount);
        } else {
          toast.error("No data found");
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

  const updateBlock = async (userId: string, isActive: boolean) => {
    try {
      const actionText = isActive ? "Unblock user" : "Block user";
      const confirmationText = isActive
        ? "Are you sure you want to unblock this user?"
        : "Are you sure you want to block this user? ";

      Swal.fire({
        title: confirmationText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: actionText,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { data } = await axios.patch(
            `${API_ADMIN_URL}/blockusers`,
            { userId, isActive },
            {
              headers: {
                "Content-Type": CONTENT_TYPE_JSON,
              },
            }
          );

          setUsersList((prevUsersList) =>
            prevUsersList.map((user) =>
              user._id === userId ? { ...user, isActive: !user.isActive } : user
            )
          );

          if (data.message === "User is unblocked") {
            toast.success("User has been successfully unblocked.");
          } else if (data.message === "User is blocked") {
            toast.success("User has been successfully blocked.");
          }
        } else {
          navigate("/Adminhome");
        }
      });
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

  // Filter users based on search term
  const filteredUsers = usersList.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(countPosts / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div>
      <div>
        <Navbar />
        <div className="flex">
          {/* Sidebar */}
          <Adminsidebar />

          {/* Main Content */}

          <main className="ml-36 w-3/5 flex-1 p-4">
            <div className="container mx-auto">
              {/* Search Bar */}
              <div className=" pb-1 w-full ">
                <h1
                  className="text-left ml-20  nb-20    mt-20 "
                  style={{ color: "white", fontSize: "25px" }}
                >
                  User Management System
                </h1>
              </div>

              <div className="">
                <div className="flex justify-end mb-10">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type here..."
                    className="bg-gray-800 text-white px-4 py-2 rounded-l-full w-1/3 outline-none"
                  />
                </div>

                {/* User Cards */}
                <div className="space-y-4 ">
                  {usersList.length > 0 ? (
                    usersList.map((user) => (
                      <div
                        key={user._id}
                        className="bg-white text-black p-4 rounded-lg flex justify-between items-center max-w-4xl mx-auto"
                      >
                        <div className="flex items-center space-x-4">
                          <FaRegUser style={{ fontSize: "45px" }} />
                          <div>
                            <p className="font-bold">{user.name}</p>
                            <p className="text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="contained"
                          onClick={() => updateBlock(user._id, user.isActive)}
                          color={
                            user.isActive === true ? "secondary" : "primary"
                          }
                        >
                          {user.isActive === false ? "Block" : "Unblock"}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      No users found for the search term.
                    </p>
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-8">
                <nav className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Button
                      key={index}
                      variant="text"
                      color="primary"
                      className="text-lg"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </nav>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
