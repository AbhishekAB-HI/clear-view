import React, { useState } from "react";
import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaHome,
  FaUserFriends,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const SideBar2 = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar after a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger menu button for smaller screens */}
      <button
        className="md:hidden fixed top-40 left-0 z-50 text-2xl text-white focus:outline-none"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-40 left-0 h-full  w-60 p-4 space-y-4 transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-1/5 md:left-20 md:p-4 md:space-y-4 md:fixed md:h-screen overflow-y-auto`}
      >
        <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
          <Link
            to="/homepage"
            onClick={handleLinkClick}
            className="flex items-center"
          >
            <FaHome className="text-[30px] hover:text-[35px]" />
            <span className="ml-2 text-[16px] md:text-[20px] hover:text-[18px] md:hover:text-[22px]">
              Home
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
          <Link
            to="/message"
            onClick={handleLinkClick}
            className="flex items-center"
          >
            <FaEnvelope className="text-[30px] hover:text-[35px]" />
            <span className="ml-2  text-[16px] md:text-[20px] hover:text-[18px] md:hover:text-[22px]">
              Message
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
          <Link
            to="/followers"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <FaUserFriends className="text-[30px] hover:text-[35px]" />
            <span className=" ml-2 text-[16px] md:text-[20px] hover:text-[18px] md:hover:text-[22px]">
              Followers
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
          <Link
            to="/following"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <FaUserFriends className="text-[30px] hover:text-[35px]" />
            <span className="ml-2 text-[16px] md:text-[20px] hover:text-[18px] md:hover:text-[22px]">
              Following
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
          <Link
            to="/notifications"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <FaBell className="text-[30px] hover:text-[35px]" />
            <span className=" ml-2 text-[16px] md:text-[20px] hover:text-[18px] md:hover:text-[22px]">
              Notifications
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer text-[35px] hover:scale-110 transition-transform duration-200">
          <Link
            to="/people"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <FaUserFriends className="text-[30px] hover:text-[35px]" />
            <span className=" ml-2  text-[16px] md:text-[20px] hover:text-[18px] md:hover:text-[22px]">
              People
            </span>
          </Link>
        </div>
      </aside>

      {/* Overlay for smaller screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default SideBar2;
