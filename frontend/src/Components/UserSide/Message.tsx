import { useFetcher, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import { useDispatch, useSelector } from "react-redux";
import { setChats, setSelectedChat } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import Navbar2 from "./Navbar2";
import { API_CHAT_URL, CONTENT_TYPE_JSON } from "../Constants/Constants";
import axios from "axios";
import { Chats, FormattedChat, IUser } from "../Interfaces/Interface";
import SideNavBar from "./SideNavbar";
import { MessageCircle, PlusCircle, Search, Users, X } from "lucide-react";
import SideBar2 from "./Sidebar2";
const MessagePage = () => {
  const [Loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [saveAllmessage, setsaveAllmessage] = useState<FormattedChat[]>([]);
  const [saveAllgroupmessage, setsaveAllgroupmessage] = useState<
    FormattedChat[]
  >([]);
  const [saveAllUsers, setsaveAllUsers] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchusers, setsearchusers] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [findtheUsers, setfindtheUsers] = useState([]);
  const [saveTheUser, setsaveTheUser] = useState([]);
  const [saveGroupinfo, setsaveGroupinfo] = useState<Chats>();
  const [findAllUsers, setfindAllUsers] = useState<IUser[]>([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  type RootState = ReturnType<typeof store.getState>;
  const [isFormVisible, setIsFormVisible] = useState(false);

   const notifications = useSelector(
     (state: RootState) => state.accessTocken.Notification
   );

  // Function to toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };



  
  const getchat = useSelector((state: RootState) => state.accessTocken.chats);

  const getselectedchat = useSelector(
    (state: RootState) => state.accessTocken.SelectedChat
  )




  useEffect(() => {
    const FindAllUsers = async () => {
      const { data } = await ClientNew.get(`${API_CHAT_URL}/getUsers`);
      if (data.message === "Get all users") {
        setfindAllUsers(data.getTheuser);
      } else {
        toast.error("No user found here");
      }
    };
    FindAllUsers();
  }, []);




  useEffect(() => {
    const getAdminInfo = async () => {
      try {
        const { data } = await ClientNew.get(`${API_CHAT_URL}/getgroupchats`);
        if (data.message === "get all chats") {
          setsaveTheUser(data.getAllChats);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAdminInfo();
  }, []);




  const accessgroupChat = async (chatId: String, groupname: String) => {
    try {
      const { data } = await ClientNew.post(
        `${API_CHAT_URL}/forgroup`,
        { chatId },
        {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        }
      );

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
      const { data } = await ClientNew.post(
        `${API_CHAT_URL}`,
        { chatId },
        {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        }
      );
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
      const filtered = findAllUsers.filter((user) =>
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
        const { data } = await ClientNew.get(`${API_CHAT_URL}/groupusers`, {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        });
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
        const { data } = await ClientNew.get(`${API_CHAT_URL}/allmessages`, {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        });

        if (data.message === "other message get here") {
          setgetAlluser(data.foundUsers);
          setsaveAllmessage(data.formattedChats);
          setsaveAllgroupmessage(data.formatgroupchats);
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

    getAllPost();
  }, []);


  
  const getAdminInfo = async () => {
    try {
      const { data } = await ClientNew.get(`${API_CHAT_URL}/getgroupchats`);
      if (data.message === "get all chats") {
        setsaveTheUser(data.getAllChats);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length === 0) {
      toast.error("Please provide a group name and select at least one user.");
      return;
    }

    try {
      const response = await ClientNew.post(
        `${API_CHAT_URL}/createGroup`,
        { groupName, users: selectedUsers },
        {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        }
      );

      if (response.data.message === "created new Group") {
        toast.success("Group created successfully!");
        setsaveGroupinfo(response.data.createdGroup);
        setIsFormVisible(!isFormVisible);
        setGroupName("");
        setSearchTerm("");
        setSelectedUsers([]);
        getAdminInfo();
      } else {
        toast.error("Failed to create group.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  


   const FindUserSearch = (term) => {
     setsearchusers(term);
     // Implement user filtering logic here
     const filtered = findAllUsers.filter((user) =>
       user.name.toLowerCase().includes(term.toLowerCase())
     );
     setfindtheUsers(filtered);
   };



  const handleUserSearch = (term) => {
    setSearchTerm(term);
    // Implement user filtering logic here
    const filtered = getAlluser.filter((user) =>
      user.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Handle selecting a user to add to the group
  const handleUserSelect = (user: any) => {
    if (!selectedUsers.some((u: any) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    const updatedUsers = selectedUsers.filter((user) => user._id !== userId);
    setSelectedUsers(updatedUsers);
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <div className="flex ">
        {/* <SideBar2 /> */}
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

            {findtheUsers.length > 0 && (
              <ul className="absolute z-10 w-1/4 bg-white dark:bg-gray-800 rounded-xl mt-20 max-h-48 overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {findtheUsers.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => accessChat(user)}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                  >
                    {/* Add user avatar if available */}
                    <div className="">
                      <img
                        src={user.image}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium"
                        alt=""
                      />
                      {/* {user.name.charAt(0)} */}
                    </div>

                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
          </div>
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

                      {filteredUsers.length > 0 && (
                        <ul className="absolute z-10 w-full bg-gray-800 rounded-lg mt-2 max-h-48 overflow-y-auto shadow-lg">
                          {filteredUsers.map((user) => (
                            <li
                              key={user._id}
                              onClick={() => handleUserSelect(user)}
                              className="px-4 py-2 hover:bg-blue-600 cursor-pointer"
                            >
                              {user.name}
                            </li>
                          ))}
                        </ul>
                      )}
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
                {Loading ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {/* Individual Users */}

                    {getAlluser.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Users className="mr-2 text-blue-500" />
                          Users
                        </h2>
                        <div className="space-y-4">
                          {saveAllmessage.map((message, index) => (
                            <div key={index}>
                              {getAlluser.map((user) => (
                                <div
                                  key={user._id}
                                  onClick={() => accessChat(user._id)}
                                  className="flex items-center bg-gray-900 hover:bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors"
                                >
                                  <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full mr-4 object-cover"
                                  />
                                  <div className="flex flex-col space-y-1">
                                    <p className="text-lg text-left font-medium">
                                      {user.name}
                                    </p>
                                    <p className="text-gray-400 text-left text-md">
                                      <span className="font-semibold">
                                        {message.lastMessage}
                                      </span>
                                    </p>
                                    <p className="text-gray-500 text-left  text-xs">
                                      {formatTime(message.lastMessageTime)}{" "}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Group Chats */}
                    {saveTheUser.length > 0 && (
                      <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <MessageCircle className="mr-2 text-blue-500" />
                          Group Chats
                        </h2>
                        <div className="space-y-4">
                          {saveAllgroupmessage.map((groupchat, index) => (
                            <div key={index}>
                              {saveTheUser.map((group) => (
                                <div
                                  key={group._id}
                                  onClick={() =>
                                    accessgroupChat(group._id, group.chatName)
                                  }
                                  className="flex items-center bg-gray-900 hover:bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors"
                                >
                                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                                    <Users className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-lg font-medium">
                                      {group.chatName}
                                    </p>
                                    <p className="text-gray-400 text-left text-md">
                                      <span className="font-semibold">
                                        {groupchat.lastMessage}
                                      </span>
                                    </p>
                                    <p className="text-gray-500 text-left  text-xs">
                                      {formatTime(groupchat.lastMessageTime)}{" "}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {getAlluser.length === 0 && saveTheUser.length === 0 && (
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
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagePage;
