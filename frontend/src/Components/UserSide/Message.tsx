import { Link, useNavigate } from "react-router-dom";
import {
  FaBell,
  FaEnvelope,
  FaHome,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { MdOutlinePostAdd } from "react-icons/md";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import { FormEvent, ReactElement,useCallback, useEffect, useState } from "react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import ThreeDot from "react-loading";
import { useDispatch, useSelector } from "react-redux";
import { Chats, setChats, setSelectedChat } from "../../Redux-store/redux-slice";
import { store } from "../../Redux-store/reduxstore";
const MessagePage = () => {
  interface IUser {
    _id: any;
    name: string;
    email: string;
    image: string;
    password: string;
    isActive: boolean;
    isAdmin: boolean;
    isVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  const [Loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const dispatch = useDispatch();
    const navigate = useNavigate(); 
  type RootState = ReturnType<typeof store.getState>;

  const getchat = useSelector((state: RootState) => state.accessTocken.chats);

 

  const getselectedchat = useSelector(
    (state: RootState) => state.accessTocken.SelectedChat
  );

  // Example of setting chats




 


  const accessChat = async (chatId: String) => {
    try {

      const { data } = await ClientNew.post(
        `http://localhost:3000/api/chat`,
        { chatId },
        {
          headers: {
            "Content-type": "application/json",
          },
        }
      );

      if (data.message === "Chat created succesfully") {
        if (!getchat.find((c) => c._id === data.fullChat._id))dispatch(setChats([data.fullChat, ...getchat]));
        dispatch(setSelectedChat(data.fullChat));
       navigate(`/chatpage/${chatId}/${data.fullChat._id}`);

      }
    } catch (error) {
      console.log(error);
    }
  };


   


   useEffect(()=>{

    
    const getAllPost =async()=>{
      const { data } = await ClientNew.get(
        `http://localhost:3000/api/chat/allusers`, 
        {
          headers: {
            "Content-type": "application/json",
          },
        }
      );

        setgetAlluser(data);
    
    }

     getAllPost()

   },[])

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!search) {
      throw new Error("No search ID");
    }
    try {
      setLoading(true);
      const { data } = await ClientNew.get(
        `http://localhost:3000/api/user/searched?search=${search}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.message === "get all users") {
        setSearchResult(data.SearchedUsers);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error Occurred!");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="px-4 py-3 shadow-md fixed w-full top-0 left-0 z-50 bg-black">
        <div className="container mx-auto flex items-center justify-between">
          {/* Header and Search Bar */}
          <div className="flex items-center space-x-4">
            {/* Logo Section */}
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "Viaoda Libre" }}
            >
              Clear View
            </h1>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex items-center space-x-2 mr-40"
          >
            <input
              type="search"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 mr-8 rounded-full outline-none"
            />
            <Button style={{ color: "white" }} variant="outlined" type="submit">
              Search
            </Button>
          </form>
          {/* Account Management Section */}
          {/* ... */}
        </div>
      </nav>

      <div className="flex mt-20">
        {/* Sidebar */}
        <aside className="w-1/5 p-4 space-y-4 fixed left-20 h-screen overflow-y-auto">
          <div className="flex items-center space-x-2 ">
            <FaHome style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px", color: "white" }}>
              {" "}
              <Link to="/homepage">Home</Link>{" "}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Message</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUserFriends style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Followers</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUsers style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Community</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaBell style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>Notification</span>
          </div>
          <div className="flex items-center space-x-2">
            <MdOutlinePostAdd style={{ fontSize: "30px" }} />
            <span style={{ fontSize: "20px" }}>
              {" "}
              <Link to="/createpost">createpost</Link>
            </span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-4/5 ml-auto p-4">
          {/* Messages Section */}

          <div className="space-y-4">
            <h1
              style={{ fontSize: "25px" }}
              className=" flex text-xl font-bold ml-0"
            >
              Messages
            </h1>
           
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagePage;
