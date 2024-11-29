import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setChats, setSelectedChat } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import Navbar2 from "./Navbar2";
import { API_CHAT_URL } from "../Constants/Constants";
import axios from "axios";
import {
  ActiveUsersType,
  FormattedChat,
  IUser,
  Notification,
} from "../Interfaces/Interface";
import SideNavBar from "./SideNavbar";
import { MessageCircle, PlusCircle, Search, Users, X } from "lucide-react";
import io, { Socket } from "socket.io-client";
import axiosClient from "../../Services/Axiosinterseptor";
const ENDPOINT = "http://localhost:3000";
let socket: Socket;
let selectedChatCompare: any;
const MessagePage = () => {
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [saveAllmessage, setsaveAllmessage] = useState<FormattedChat[]>([]);
  const [saveAllgroupmessage, setsaveAllgroupmessage] = useState<FormattedChat[]>([]);
  const [saveAllUsers, setsaveAllUsers] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchusers, setsearchusers] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [findtheUsers, setfindtheUsers] = useState<IUser[]>([]);
  const [saveTheUser, setsaveTheUser] = useState<FormattedChat[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUsersType[]>([]);
  const [findAllUsers, setfindAllUsers] = useState<IUser[]>([]);
  const [SaveAllNotifications, setSaveAllNotifications] = useState<Notification[]>([]);
  const [postsPerPage] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentgroupPage, setCurrentgroupPage] = useState(1);
  const [totalGroupPosts, setTotalGroupPosts] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  type RootState = ReturnType<typeof store.getState>;
  const [isFormVisible, setIsFormVisible] = useState(false);



  // Function to toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const userDetails = useSelector(
    (state: RootState) => state.accessTocken.userTocken
  );


  useEffect(() => {
    socket = io(ENDPOINT);
    if (userDetails) {
      socket.emit("setup", userDetails);
    }
    return () => {
      socket.disconnect();
    };
  }, [userDetails]);

  useEffect(() => {
    socket.on("get-users", (users: ActiveUsersType[]) => {
      setActiveUsers(users);
    });
  }, []);

  const getNotifications = async () => {
    try {
      const { data } = await axiosClient.get(
        `${API_CHAT_URL}/getnotifications`
      );
      if (data.message === "get all notifications") {
        setSaveAllNotifications(data.notifications);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllPost = async () => {
    try {
      const { data } = await axiosClient.get(
        `${API_CHAT_URL}/allmessages?page=${currentPage}&limit=${postsPerPage}`
      );
      if (data.message === "other message get here") {
        setgetAlluser(data.foundUsers);
        setsaveAllmessage(data.formattedChats);
        setTotalPosts(data.totalDirectChats);
      } else {
        toast.error("other message is not get here");
      }
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

  useEffect(() => {
    getAllPost();
  }, [currentPage]);

  useEffect(() => {
    socket.on("hello", () => {
      toast.success("hello");
    });
  }, []);
  useEffect(() => {
    socket.on("notification received", (newMessageReceived: any) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        getNotifications();
        getAllPost();
      } else {
      }
    });
  }, []);

  const getchat = useSelector((state: RootState) => state.accessTocken.chats);


  useEffect(() => {
    const FindAllUsers = async () => {
      const { data } = await axiosClient.get(`${API_CHAT_URL}/getusers`);
      if (data.message === "Get all users") {
        setfindAllUsers(data.getTheuser);
      } else {
        toast.error("No user found here");
      }
    };
    FindAllUsers();
  }, []);

  useEffect(() => {
    const getGroupchats = async () => {
      try {
        const { data } = await axiosClient.get(
          `${API_CHAT_URL}/getgroupchats?page=${currentgroupPage}&limit=${postsPerPage}`
        );
        if (data.message === "get all chats") {
          setsaveTheUser(data.groupChats);
          setTotalGroupPosts(data.totalGroupChats);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getGroupchats();
  }, []);

  const accessgroupChat = async (chatId: String, groupname: String) => {
    try {
      const { data } = await axiosClient.post(`${API_CHAT_URL}/getgroup`, {
        chatId,
      });
      if (data.message === "Chat created succesfully") {
        if (!getchat.find((c) => c._id === data.fullChat._id))
          dispatch(setChats([data.fullChat, ...getchat]));
        dispatch(setSelectedChat(data.fullChat));
        navigate(`/groupchatpage/${chatId}/${data.fullChat._id}/${groupname}`);
      } else {
        toast.error("Chat created  Failed");
      }
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

  const accessChat = async (chatId: String) => {
    try {
      const { data } = await axiosClient.post(`${API_CHAT_URL}`, { chatId });
      if (data.message === "Chat created succesfully") {
        if (!getchat.find((c) => c._id === data.fullChat._id))
          dispatch(setChats([data.fullChat, ...getchat]));
        dispatch(setSelectedChat(data.fullChat));
        navigate(`/chatpage/${chatId}/${data.fullChat._id}`);
      } else {
        toast.error("Chat created  Failed");
      }
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

  useEffect(() => {
    if (searchusers) {
      const filtered= findAllUsers.filter((user) =>
        user.name.toLowerCase().includes(searchusers.toLowerCase())
      );
      setfindtheUsers(filtered);
    } else {
      setfindtheUsers([]);
    }
  }, [searchusers, findAllUsers]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = saveAllUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, saveAllUsers]);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const { data } = await axiosClient.get(`${API_CHAT_URL}/groupusers`);
        if (data.message === "Users found") {
          setsaveAllUsers(data.getusers);
        } else {
          toast.error("No users found here");
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllUsers();
  }, []);

  useEffect(() => {
    const getAllPost = async () => {
      try {
        const { data } = await axiosClient.get(
          `${API_CHAT_URL}/allmessages?page=${currentPage}&limit=${postsPerPage}`
        );
        if (data.message === "other message get here") {
          setgetAlluser(data.foundUsers);
          setsaveAllmessage(data.formattedChats);
          setsaveAllgroupmessage(data.formatgroupchats);
          setTotalPosts(data.totalDirectChats);
          setTotalGroupPosts(data.totalGroupChats);
        } else {
          toast.error("other message is not get here");
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
              // toast.error("Posts not found.");
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

    getAllPost();
  }, []);

  const getGroupchats = async () => {
    try {
      const { data } = await axiosClient.get(
        `${API_CHAT_URL}/getgroupchats?page=${currentgroupPage}&limit=${postsPerPage}`
      );
      if (data.message === "get all chats") {
        setsaveTheUser(data.groupChats);
        setTotalGroupPosts(data.totalGroupChats);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getGroupchats();
  }, [currentgroupPage]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length === 0) {
      toast.error("Please provide a group name and select at least one user.");
      return;
    }

    try {
      const response = await axiosClient.post(`${API_CHAT_URL}/creategroup`, {
        groupName,
        users: selectedUsers,
      });

      if (response.data.message === "created new Group") {
        toast.success("Group created successfully!");
        setIsFormVisible(!isFormVisible);
        setGroupName("");
        setSearchTerm("");
        setSelectedUsers([]);
        getGroupchats();
        getAllPost();
      } else {
        toast.error("Failed to create group.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  const FindUserSearch = (term:string) => {
    setsearchusers(term);
    const filtered = findAllUsers.filter((user) =>
      user.name.toLowerCase().includes(term.toLowerCase())
    );
    setfindtheUsers(filtered);
  };

  const handleUserSearch = (term:string) => {
    setSearchTerm(term);
    const filtered = getAlluser.filter((user) =>
      user.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user: IUser) => {
    if (!selectedUsers.some((u: IUser) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId:string) => {
    const updatedUsers = selectedUsers.filter((user:any) => user._id !== userId);
    setSelectedUsers(updatedUsers);
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const totalGPages = Math.ceil(totalGroupPosts / postsPerPage);

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <div className="flex ">
      
        <SideNavBar />
        <main className="w-4/5 ml-auto ">
          <div className="max-w-xl mt-5 mx-auto p-6">
            <div className="fixed w-4/5 pt-10 pb-5 right-10 bg-black ">
              <div className="flex justify-between items-center ml-20 mb-8">
                <h1 className="text-3xl font-bold flex items-center">
                  <MessageCircle className="mr-3 text-blue-500" />
                  Messages
                </h1>
                <button
                  onClick={toggleForm}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusCircle className="mr-5" />
                  New Group
                </button>
              </div>
              <form className=" w-2/4 ml-20  group">
                <div className="relative">
                  <input
                    type="text"
                    value={searchusers}
                    onChange={(e) => FindUserSearch(e.target.value)}
                    placeholder="Find Friends"
                    className="w-full pl-12 text-black pr-4 py-3 text-base bg-white rounded-full border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm placeholder:text-gray-400"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </form>
            </div>
          </div>
          {findtheUsers.length > 0 && (
            <ul className=" z-10 w-1/4 ml-0 bg-white dark:bg-gray-800 rounded-xl mt-40 max-h-48 overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {findtheUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={() => accessChat(user._id)}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                >
                  <div className="">
                    <img
                      src={user.image}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium"
                      alt=""
                    />
                    {/* {user.name.charAt(0)} */}
                  </div>

                  <div className="ml-3 ">
                    <p className="text-sm  font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    {/* Add additional user info if available */}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email.toLowerCase().replace(/\s+/g, "_")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="bg-black min-h-screen text-white">
            <div className="container  mt-40 mx-auto px-4 py-8">
              {isFormVisible && (
                <div className="bg-black rounded-lg p-6 mb-8 shadow-xl">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label
                        className="block text-sm font-medium mb-2"
                        htmlFor="groupname"
                      >
                        Group Name
                      </label>
                      <input
                        type="text"
                        id="groupname"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-gray-800 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter group name..."
                        required
                      />
                    </div>

                    <div className="mb-6 ">
                      <label
                        className="block text-sm font-medium mb-2"
                        htmlFor="groupname"
                      >
                        Add users
                      </label>
                      <div className="">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          id="adduser"
                          value={searchTerm}
                          onChange={(e) => handleUserSearch(e.target.value)}
                          className="w-full bg-gray-800 border-none rounded-lg py-3 px-10 focus:ring-2 focus:ring-blue-500"
                          placeholder="Search for users..."
                        />
                      </div>

                      {filteredUsers.map((user) => (
                        <li
                          key={user._id}
                          onClick={() => handleUserSelect(user)}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                        >
                          <div className="">
                            <img
                              src={user.image}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium"
                              alt=""
                            />
                            {/* {user.name.charAt(0)} */}
                          </div>

                          <div className="ml-3 ">
                            <p className="text-sm  font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </p>
                            {/* Add additional user info if available */}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email.toLowerCase().replace(/\s+/g, "_")}
                            </p>
                          </div>
                        </li>
                      ))}
                    </div>

                    {selectedUsers.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {selectedUsers.map((user) => (
                            <div
                              key={user._id}
                              className="bg-blue-700 rounded-full px-3 py-1 flex items-center"
                            >
                              {user.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user._id)}
                                className="ml-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                    >
                      Create Group
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-6">
               
                    {getAlluser.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Users className="mr-2 text-blue-500" />
                          Users
                        </h2>
                        <div className="space-y-4">
                          {getAlluser.map((user, index) => (
                            <div
                              key={index}
                              onClick={() => accessChat(user._id)}
                              className="flex items-center bg-gray-900 hover:bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors"
                            >
                              {/* Online/Offline Dot Indicator */}
                              <span
                                className={`h-3 w-3 rounded-full mr-0 mt-10 ${
                                  activeUsers.some(
                                    (activeUser) =>
                                      activeUser.userId === user._id
                                  )
                                    ? "bg-green-500" // Green dot for online
                                    : "bg-gray-400" // Gray dot for offline
                                }`}
                              ></span>

                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-12 h-12 rounded-full mr-4 object-cover"
                              />
                              <div className="flex flex-col space-y-1">
                                <p className="text-lg text-left font-medium">
                                  {user.name}
                                </p>
                                {saveAllmessage &&
                                  saveAllmessage.map(
                                    (message, index) =>
                                      message.userId === user._id && (
                                        <div key={index}>
                                          <p className="text-left text-md">
                                            {SaveAllNotifications.length > 0 &&
                                            SaveAllNotifications[
                                              SaveAllNotifications.length - 1
                                            ].sender._id === message.userId ? (
                                              <span className="text-white font-extrabold">
                                                {
                                                  SaveAllNotifications[
                                                    SaveAllNotifications.length -
                                                      1
                                                  ].content
                                                }
                                                {SaveAllNotifications.length >
                                                  2 && (
                                                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-sm">
                                                    +
                                                    {SaveAllNotifications.length -
                                                      1}
                                                  </span>
                                                )}
                                              </span>
                                            ) : (
                                              <span className="text-gray-400 font-semibold">
                                                {message.lastMessage}
                                              </span>
                                            )}
                                          </p>

                                          <p className="text-gray-500 text-left text-xs">
                                            {formatTime(
                                              message.lastMessageTime
                                            )}
                                          </p>
                                        </div>
                                      )
                                  )}

                                {activeUsers.some(
                                  (activeUser) => activeUser.userId === user._id
                                ) ? (
                                  <></>
                                ) : (
                                  <p className="text-gray-500">
                                    Last seen :{" "}
                                    <small>{formatTime(user.lastSeen)}</small>{" "}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            className={`text-sm ${
                              page === currentPage
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-blue-500"
                            } px-3 py-1 rounded-md`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          className={`text-sm text-blue-500 ${
                            currentPage === totalPages &&
                            "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          {">"}
                        </button>
                      </nav>
                    </div>

                    {/* Group Chats */}
                    {saveTheUser.length > 0 && (
                      <div className="mt-10">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <MessageCircle className="mr-2 text-blue-500" />
                          Group Chats
                        </h2>
                        <div className="space-y-4 ">
                          <div>
                            {saveTheUser.map((group) => (
                              <div
                                key={group._id}
                                onClick={() =>
                                  accessgroupChat(group._id, group.chatName)
                                }
                                className="flex items-center mt-5 bg-gray-900 hover:bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors"
                              >
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                                  <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="text-lg font-medium">
                                    {group.chatName}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {getAlluser.length === 0 &&
                      saveAllgroupmessage.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center bg-gray-900 rounded-lg p-10">
                          <MessageCircle className="w-16 h-16 text-blue-500 mb-4" />
                          <h2 className="text-2xl font-bold mb-2">
                            No Chats Found
                          </h2>
                          <p className="text-gray-400">
                            Start a conversation by creating a new group or
                            finding users
                          </p>
                        </div>
                      )}
                  
              
              </div>
              <div className="flex justify-center mt-8">
                <nav className="flex space-x-2">
                  <button
                    className={`text-lg text-blue-500 ${
                      currentgroupPage === 1 && "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() =>
                      setCurrentgroupPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentgroupPage === 1}
                  >
                    {"<"}
                  </button>
                  {Array.from({ length: totalGPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`text-sm ${
                          page === currentgroupPage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-700 text-blue-500"
                        } px-3 py-1 rounded-md`}
                        onClick={() => setCurrentgroupPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    className={`text-lg text-blue-500 ${
                      currentgroupPage === totalGPages &&
                      "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() =>
                      setCurrentgroupPage((prev) =>
                        Math.min(prev + 1, totalGPages)
                      )
                    }
                    disabled={currentgroupPage === totalGPages}
                  >
                    {">"}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagePage;
