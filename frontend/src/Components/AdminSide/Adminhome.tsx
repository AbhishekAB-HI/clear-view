import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserFriends,
  FaRegFileAlt,
  FaSignOutAlt,
  FaRegUser,
} from "react-icons/fa";
import Navbar from "./Navbar";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearAdminAccessTocken } from "../../Redux-store/redux-slice";
import { store } from "../../Redux-store/reduxstore";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
const AdminHomePage = () => {
  interface IUser extends Document {
    _id: any;
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    isAdmin: boolean;
    isVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    otp?: number;
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Change this to adjust how many users per page
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminTocken = useSelector(
    (state: ReturnType<typeof store.getState>) => state.accessTocken.AdminTocken
  );

  useEffect(() => {
    const FetchUserdetails = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/admin/admindashboardget"
        );
        if (data.message === "user data get succesfull") {
          setUsersList(data.userdata);
        }
      } catch (error) {
        console.log(error);
      }
    };
    FetchUserdetails();
  }, []);

  const handleLogout = () => {
    try {
      dispatch(clearAdminAccessTocken());
      localStorage.removeItem("admintocken");
      navigate("/Adminlogin");
    } catch (error) {
      console.log(error);
    }
  };
const updateBlock = async (userId: string, isActive: boolean) => {
  try {
    const actionText = isActive ? "Unblock user" :"Block user" 
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
          `http://localhost:3000/api/admin/blockuser`,
          { userId, isActive },
          {
            headers: {
              "Content-Type": "application/json",
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
    console.error("Error blocking/unblocking user:", error);
    toast.error("There was an error performing the action. Please try again.");
  }
};


  // Filter users based on search term
  const filteredUsers = usersList.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div>
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
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
              <span>
                <Link to="/news">News Management</Link>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegFileAlt style={{ fontSize: "20px" }} />
              <Link to="/reportpage">Report Management</Link>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegFileAlt style={{ fontSize: "20px" }} />
              <span>User Report Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaSignOutAlt style={{ fontSize: "20px" }} />
              <span>
                <button onClick={handleLogout}>Log out</button>
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-4">
          <div className="container mx-auto">
            <h1
              className="text-3xl mb-6 text-center"
              style={{ fontFamily: "Viaoda Libre" }}
            >
              User Management System
            </h1>

            {/* Search Bar */}
            <h1
              className="flex justify-left mt-10"
              style={{ color: "white", fontSize: "25px" }}
            >
              User Management System
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

            {/* User Cards */}
            <div className="space-y-4">
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
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
                      color={user.isActive === true ? "secondary" : "primary"}
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
  );
};

export default AdminHomePage;
