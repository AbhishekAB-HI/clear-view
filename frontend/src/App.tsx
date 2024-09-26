
import './App.css'
import Loginpage from './Components/UserSide/Loginpage';
import Registerpage from './Components/UserSide/RegisterPage';
import Otppage from './Components/UserSide/otp';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomeLoginPage from './Components/UserSide/HomeLoginpage';
import Forgetpassword from './Components/UserSide/forgetpassword';
import ForgetOtppage from './Components/UserSide/forgotOtp';
import ForgetPassPage from './Components/UserSide/Forgetpasspage';
import AdminLoginpage from './Components/AdminSide/AdminLogin';
import AdminHomePage from './Components/AdminSide/Adminhome';
import { Toaster } from 'react-hot-toast';
import UserLogoutPrivateRoute from './ProtectiveRoute/UserLogoutProtective';
import AdminprivateRoute from './ProtectiveRoute/AdminPrivateRoute';
import AdminLogoutprivateRoute from './ProtectiveRoute/AdminLogout';
import HomeProfilepage from './Components/UserSide/Profilepage';

import { useState } from 'react';
import Postpage from './Components/UserSide/Addpost';
import EditPostModal from './Components/UserSide/EditpostPage';
import Newsmanagement from './Components/AdminSide/Newsmanagemant';
import MessagePage from './Components/UserSide/Message';
import Reportmanagement from './Components/AdminSide/ReportPost';
import ChatPage from './Components/UserSide/ChatpageUI';




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
          <Route path="/profile" element={<HomeProfilepage />} />
          <Route path="/editprofile" />
          <Route
            path="/createpost"
            element={<Postpage togglepostModal={togglepostModal} />}
          />
          <Route path="/message" element={<MessagePage />} />
          <Route
            path="/editpost"
            element={
              <EditPostModal toggleeditpostModal={toggleeditpostModal} />
            }
          />
          <Route path="/news" element={<Newsmanagement />} />
          <Route path="/reportpage" element={<Reportmanagement />} />

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

export default App
