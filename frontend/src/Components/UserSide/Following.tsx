

import toast from "react-hot-toast";
import { FormEvent, useEffect, useState } from "react";
import ClientNew from "../../Redux-store/Axiosinterceptor";
import ThreeDot from "react-loading";
import { store } from "../../Redux-store/Reduxstore";
import Navbar2 from "./Navbar2";
import SideBar2 from "./Sidebar2";
import { API_CHAT_URL, API_USER_URL, CONTENT_TYPE_JSON } from "../Constants/Constants";
import axios from "axios";
import { IUser } from "../Interfaces/Interface";
import SideNavBar from "./SideNavbar";
const FollowingPage = () => {
 
  const [Loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<IUser[]>([]);
  const [getAlluser, setgetAlluser] = useState<IUser[]>([]);
  const [userID, setuserID] = useState<string>("");
  const [userFound, setuserFound] = useState(false);
  type RootState = ReturnType<typeof store.getState>;

  const updateUsers = async () => {

      try {
         const { data } = await ClientNew.get(`${API_CHAT_URL}/allusers`, {
           headers: {
             "Content-type": CONTENT_TYPE_JSON,
           },
         });

          if (data.message === "Other users found"){
            setgetAlluser(data.otherusers);
          }else{
            toast.error("Failed to get other users")
          }
      
      } catch (error:unknown) {
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


  useEffect(() => {
      const findUsers = async () => {
        try {
            const { data } = await ClientNew.get(`${API_CHAT_URL}/getUserdata`);
            if (data.message === "userId get") {
              setuserID(data.userId);
            }else{
              toast.error("user id not found")
            }
        } catch (error:unknown) {
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
      findUsers();
  }, []);

  const followUser = async (userId: string, LoguserId: string) => {
    try {
      const { data } = await ClientNew.post(
        `${API_CHAT_URL}/followuser`,
        { userId, LoguserId },
        {
          headers: {
            "Content-type": CONTENT_TYPE_JSON,
          },
        }
      );
      if (data.message === "followed users") {
        setuserFound(data.addFollower);
        updateUsers();
      }else{
         toast.error("followed user failed");
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
    const getAllPost = async () => {
        try {
           const { data } = await ClientNew.get(`${API_CHAT_URL}/allusers`, {
             headers: {
               "Content-type": CONTENT_TYPE_JSON,
             },
           });

             if (data.message === "Other users found") {
               setgetAlluser(data.otherusers);
             } else {
               toast.error("Failed to get other users");
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

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!search) {
      throw new Error("No search ID");
    }
    try {
      setLoading(true);
      const { data } = await ClientNew.get(
        `${API_USER_URL}/searched?search=${search}`,
        {
          headers: {
            "Content-Type": CONTENT_TYPE_JSON,
          },
        }
      );
      if (data.message === "get all users") {
        setSearchResult(data.SearchedUsers);
        setLoading(false);
      }else{
        toast.error("No user found here")
      }
    } catch (error) {
      setLoading(false);
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

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar2 />
      <SideNavBar />
      <div className="flex mt-12">
        {/* Sidebar */}

        {/* Main Content */}
        <main className="w-4/5 ml-auto ">
          {/* Messages Section */}
          <div className="fixed  bg-black w-full pl-5     pt-5  pb-5">
            <h1
              style={{ fontSize: "25px" }}
              className=" flex text-xl font-bold ml-0"
            >
              Following
            </h1>
          </div>

          <div className="space-y-4 p-5 mt-20  w-full h-[100vh]">
            <div className="space-y-4   w-full h-[100vh]">
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
                    className="flex items-center justify-between bg-gray-900 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-5 w-full">
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
                    <div>
                      <button
                        onClick={() => followUser(user._id, userID)}
                        color={!userFound ? "blue" : "white"}
                        className={
                          !userFound
                            ? "mr-10 px-4 py-2 text-white font-semibold rounded-full border border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300"
                            : "mr-10 px-4 py-2 text-white font-semibold bg-blue-600 rounded-full border border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300"
                        }
                      >
                        {!userFound ? "Following" : "Follow"}
                      </button>
                    </div>
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

export default FollowingPage;
