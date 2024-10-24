import "./App.css";
import Loginpage from "./Components/Userside/Loginpage";
import Registerpage from "./Components/Userside/RegisterPage";
import Otppage from "./Components/Userside/Otp";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomeLoginPage from "./Components/Userside/HomeLoginpage";
import Forgetpassword from "./Components/Userside/Forgetpassword";
import ForgetOtppage from "./Components/Userside/ForgotOtp";
import ForgetPassPage from "./Components/Userside/Forgetpasspage";
import AdminLoginpage from "./Components/AdminSide/Adminlogin";
import AdminHomePage from "./Components/AdminSide/Adminhome";
import { Toaster } from "react-hot-toast";
import UserLogoutPrivateRoute from "./ProtectiveRoute/UserLogoutProtective";
import AdminprivateRoute from "./ProtectiveRoute/AdminPrivateRoute";
import AdminLogoutprivateRoute from "./ProtectiveRoute/AdminLogout";
import HomeProfilepage from "./Components/Userside/Profilepage";

import { useState } from "react";
import Postpage from "./Components/Userside/Addpost";
import EditPostModal from "./Components/Userside/EditPostPage";
import Newsmanagement from "./Components/AdminSide/Newsmanagemant";
import MessagePage from "./Components/Userside/Message";
import Reportmanagement from "./Components/AdminSide/Reportpost";
import ChatPage from "./Components/Userside/ChatpageUI";
import { Videopage } from "./Components/Userside/Videopage";
import RoomPage from "./Components/Zego-cloud/RoomPage";
import FollowersPage from "./Components/Userside/FollowersPage";
import FollowingPage from "./Components/Userside/Following";
import PeoplePage from "./Components/Userside/PeoplePage";
import UserReportmanagement from "./Components/AdminSide/UserReportPage";
import GroupChatPage from "./Components/Userside/GroupChatpage";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showpostModal, setShowpostModal] = useState(false);
  const [ShoweditpostModal, setShoweditpostModal] = useState(false);
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const togglepostModal = () => {
    setShowpostModal(!showpostModal);
  };

  const toggleeditpostModal = () => {
    setShoweditpostModal(!ShoweditpostModal);
  };

  return (
    <>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route
            path="/register"
            element={<UserLogoutPrivateRoute element={<Registerpage />} />}
          />
          <Route
            path="/login"
            element={<UserLogoutPrivateRoute element={<Loginpage />} />}
          />
          <Route
            path="/verify-otp"
            element={<UserLogoutPrivateRoute element={<Otppage />} />}
          />
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/homepage" element={<HomeLoginPage />} />
          <Route path="/chatpage/:chatId/:dataId" element={<ChatPage />} />
          <Route path="/groupchatpage/:chatId/:dataId/:groupname" element={<GroupChatPage />} />

          <Route path="/profile" element={<HomeProfilepage />} />
          {/* <Route path="/videopage/:roomId" element={<Videopage />} /> */}
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/editprofile" />
          <Route
            path="/createpost"
            element={<Postpage togglepostModal={togglepostModal} />}
          />
          <Route path="/message" element={<MessagePage />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/followers" element={<FollowersPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route
            path="/editpost"
            element={
              <EditPostModal toggleeditpostModal={toggleeditpostModal} />
            }
          />
          <Route path="/news" element={<Newsmanagement />} />
          <Route path="/reportpage" element={<Reportmanagement />} />
          <Route path="/userReportpage" element={<UserReportmanagement />} />
          <Route
            path="/forgetpass"
            element={<UserLogoutPrivateRoute element={<Forgetpassword />} />}
          />
          <Route
            path="/forgetotp"
            element={<UserLogoutPrivateRoute element={<ForgetOtppage />} />}
          />
          <Route
            path="/ForgetPassPage"
            element={<UserLogoutPrivateRoute element={<ForgetPassPage />} />}
          />
          <Route
            path="/Adminlogin"
            element={<AdminLogoutprivateRoute element={<AdminLoginpage />} />}
          />
          <Route
            path="/Adminhome"
            element={<AdminprivateRoute element={<AdminHomePage />} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
