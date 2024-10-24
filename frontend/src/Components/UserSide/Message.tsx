import { useFetcher, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import ThreeDot from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import { setChats, setSelectedChat } from "../../Redux-store/Redux-slice";
import { store } from "../../Redux-store/Reduxstore";
import Navbar2 from "./Navbar2";
import SideBar2 from "./Sidebar2";
import { API_CHAT_URL, CONTENT_TYPE_JSON } from "../Constants/Constants";
import axios from "axios";
import { Chats, IUser } from "../Interfaces/Interface";
const MessagePage = () => {
  const [Loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [saveAllUsers, setsaveAllUsers] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [saveTheUser, setsaveTheUser] = useState([]);
   const [saveGroupinfo, setsaveGroupinfo] = useState<Chats>();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  type RootState = ReturnType<typeof store.getState>;
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Function to toggle form visibility
  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const getchat = useSelector((state: RootState) => state.accessTocken.chats);

  const getselectedchat = useSelector(
    (state: RootState) => state.accessTocken.SelectedChat
  );

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

  
  


const accessgroupChat = async (chatId: String,groupname:String) => {
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
    if (searchTerm) {
      const filtered= saveAllUsers.filter((user) =>
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
          setgetAlluser(data.OtherFiledata);
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
      <div className="flex mt-20">
        <SideBar2 />

        <main className="w-4/5 ml-auto p-0 ">
          <div className="fixed  bg-black w-full pt-10">
            <h1
              style={{ fontSize: "25px" }}
              className=" flex text-xl font-bold ml-0"
            >
              Messages
            </h1>

            <button
              className="relative items-center flex mt-5 mb-5 justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
              onClick={toggleForm}
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                New Group
              </span>
            </button>
            {isFormVisible && (
              <div className=" text-left ml-0">
                <form onSubmit={handleSubmit} className="max-w-sm">
                  <div className="mb-5">
                    <label
                      htmlFor="groupname"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Group name
                    </label>
                    <input
                      type="text"
                      id="groupname"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="Enter group name..."
                      required
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      htmlFor="adduser"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Add User to the group
                    </label>
                    <input
                      type="text"
                      id="adduser"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="Search for users..."
                    />
                    {/* User Suggestions Dropdown */}
                    {filteredUsers.length > 0 && (
                      <ul className="bg-white shadow rounded-lg mt-2 max-h-40 overflow-auto">
                        {filteredUsers.map((user) => (
                          <li
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className="p-2 text-black cursor-pointer hover:bg-blue-500 hover:text-white"
                          >
                            {user.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Display Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-5">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Selected Users:
                      </h3>
                      <ul>
                        {selectedUsers.map((user) => (
                          <li
                            key={user._id}
                            className="flex justify-between items-center text-sm text-gray-400"
                          >
                            {user.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveUser(user._id)}
                              className="ml-4 text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Create chat
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="space-y-4 p-5 mt-28  w-full h-[100vh]">
            <div className="space-y-4">
              {/* Loading or Results */}
              {Loading ? (
                <div className="flex justify-center items-center">
                  <ThreeDot className="w-20 h-3 space-x-10" color="#3168cc" />
                </div>
              ) : getAlluser.length === 0 ? (
                <div className="flex justify-center items-center">
                  <p className="text-gray-400">No users found</p>
                </div>
              ) : (
                getAlluser.map((user, index) => (
                  <div
                    key={user._id}
                    onClick={() => accessChat(user._id)}
                    className="flex items-center justify-between bg-gray-900 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.image}
                        alt="Profile"
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="text-lg font-medium">{user.name}</p>
                        <p className="text-gray-400"></p>
                      </div>
                    </div>
                    <div className="text-blue-500 text-xl font-bold"></div>
                  </div>
                ))
              )}

              <div>
                {saveTheUser.map((group, index) => (
                  <div
                    key={group._id}
                    onClick={() => accessgroupChat(group._id, group.chatName)}
                    className="flex items-center justify-between bg-gray-900 mb-5 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {/* <img
                        src={user.image}
                        alt="Profile"
                        className="w-12 h-12 rounded-full"
                      /> */}
                      <div>
                        <p className="text-lg font-medium">{group.chatName}</p>
                        <p className="text-gray-400"></p>
                      </div>
                    </div>
                    <div className="text-blue-500 text-xl font-bold"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagePage;
