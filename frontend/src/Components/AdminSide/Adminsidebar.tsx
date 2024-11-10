import React from 'react'
import {
  FaHome,
  FaUsers,
  FaUserFriends,
  FaRegFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { clearAdminAccessTocken } from '../../Redux-store/Redux-slice';
import { useDispatch } from 'react-redux';
const Adminsidebar = () => {
const dispatch = useDispatch();
const navigate = useNavigate();
    const handleLogout = () => {
      try {
        dispatch(clearAdminAccessTocken());
        localStorage.removeItem("admintocken");
        navigate("/Adminlogin");
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div>
      <aside className="w-64 bg-black text-white p-4 h-screen fixed left-20 top-20">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <FaHome style={{ fontSize: "20px" }} />
            <Link to="/Admindashboard">Dashboard</Link>
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
            <span>
              {" "}
              <Link to="/userReportpage">User Report Management</Link>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaSignOutAlt style={{ fontSize: "20px" }} />
            <span>
              <button onClick={handleLogout}>Log out</button>
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Adminsidebar