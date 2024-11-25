import React, { useEffect, useState } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserFriends,
  FaRegFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux";
import { clearAdminAccessTocken } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import { Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import axios from "axios";
import { API_ADMIN_URL } from "../Constants/Constants";
import Adminsidebar from "./Adminsidebar";
import { ICounts } from "../Interfaces/Interface";

ChartJS.register(
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userCount, setuserCount] = useState(Number);
  const [postCount, setpostCount] = useState(Number);
 const [recentPosts, setRecentPosts] = useState<ICounts[]>([]);
  const handleLogout = () => {
    try {
      dispatch(clearAdminAccessTocken());
      localStorage.removeItem("admintocken");
      navigate("/Adminlogin");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const findUserDetails = async () => {
      try {
        const { data } = await axios.get(`${API_ADMIN_URL}/userscounts`);
        if (data.message === "user and post data get succesfull") {
            setuserCount(data.userdata.totalUsers);
            setpostCount(data.userdata.totalPosts);
            setRecentPosts(data.recentPosts);
          

        }
      } catch (error) {
        console.log(error);
      }
    };
    findUserDetails();
  }, []);

  const pieData = {
    labels: ["Free", "Premium"],
    datasets: [
      {
        label: "User Account Tiers",
        data: [56, 44], // Replace with your actual data
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const barData = {
    labels: ["Post 1", "Post 2", "Post 3", "Post 4"],
    datasets: [
      {
        label: "Likes",
        data: [150, 250, 300, 220], // Replace with actual likes data
        backgroundColor: "#36A2EB",
      },
      {
        label: "Comments",
        data: [60, 80, 95, 70], // Replace with actual comments data
        backgroundColor: "#FF6384",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <Navbar />
      <div className="flex ">
        <Adminsidebar />

        {/* Main Content */}
        <main className="ml-60 w-3/5 flex-1">
          <div className="grid mt-20 grid-cols-2 gap-4">
            {/* Stats Cards */}
            <Card className="p-4">
              <CardContent>
                <Typography variant="h5">Total Users</Typography>
                <Typography variant="h3">{userCount}</Typography>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardContent>
                <Typography variant="h5">Total Articles</Typography>
                <Typography variant="h3">{postCount}</Typography>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div
              className="chart-container"
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
                margin: "0 auto",
              }}
            >
              <Pie data={pieData} />
            </div>
            <div className="chart-container">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Recent Posts Section */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-bold">Recent Posts</h3>
              <ul>
                {recentPosts?.map((post, index) => (
                  <li key={index} className="mb-4">
                    <Card className="p-4">
                      <CardContent>
                        <Typography variant="h6">{`Post ${
                          index + 1
                        }`}</Typography>
                        <Typography variant="body1">
                          {post.description}
                        </Typography>
                        <Typography variant="body2">{`Likes: ${post.totalLikes}`}</Typography>
                        <Typography variant="body2">{`Comments: ${post.totalComments}`}</Typography>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
