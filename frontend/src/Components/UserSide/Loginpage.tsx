import "tailwindcss/tailwind.css";
import { FcGoogle } from "react-icons/fc";
import newlogo from "../images/newslogo.jpg";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import {  toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import logoWeb from "../animations/Animation - 1724244656671.json";
import {
  setUserAccessTocken,
  setUserRefreshtocken,
} from "../../Redux-store/Redux-slice";
import Lottie from "lottie-react";
import { FaSpinner } from "react-icons/fa";
import { googleSignIn, loginPage } from "../../Services/User_API/Homepageapis";

const Loginpage: React.FC = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
  });

  const handlesubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true)
      const response = await loginPage(values);
      if (response.success) {
        toast.success("Login successfully");
        dispatch(setUserAccessTocken(response.Acesstoc));
        dispatch(setUserRefreshtocken(response.Refreshtoc));
        navigate("/homepage");
      } else {
        toast.error("user Login Failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      } else {
        toast.error("Unknown error occurred");
      }
      console.error("Error verifying OTP:", error);
    }finally{
       setLoading(false);
    }
  };

  return (
    <div>
      <nav className="fixed w-full top-0 left-0 z-50 bg-black border-b border-gray-700">
        <div className="px-4 py-3 pb-5 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-0">
              <Lottie
                animationData={logoWeb}
                className="w-24  sm:w-36" 
              />
              <h1
                className="text-3xl sm:text-4xl  text-white  font-bold"
                style={{ fontFamily: "Viaoda Libre" }}
              >
                Clear View
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row h-screen ">
        <div className="flex-1 bg-purple-700 flex justify-center items-center order-1 md:order-2 p-5 sm:p-20 md:p-10">
          <img
            src={newlogo}
            alt="News illustration"
            className="w-full md:w-4/5 max-w-xs md:max-w-md rounded-lg"
          />
        </div>

        <div className="flex-1 bg-black text-white flex flex-col justify-center p-5 md:p-10 order-2 md:order-1">
          <div className="mt-10 mb-5 text-center">
            <h2
              className="text-3xl md:text-3xl"
              style={{ fontFamily: "junge" }}
            >
              Your trusted source for <br /> the latest news and insights
            </h2>
          </div>

          <div className="flex flex-col mx-auto w-full md:w-3/4">
            <button
              onClick={googleSignIn}
              className="flex items-center justify-center bg-white text-black py-2 rounded text-lg font-semibold space-x-2"
            >
              <FcGoogle className="text-2xl" />

              <span style={{ fontFamily: "Roboto, sans-serif" }}>
                Sign in with Google
              </span>
            </button>
            <div
              className="text-center my-5 text-sm"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              or
            </div>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handlesubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter your Email"
                    className="py-3 px-4 border bg-black rounded mb-5 md:mb-10 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 mb-2"
                  />

                  <Field
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="py-3 px-4 border bg-black rounded mb-5 md:mb-10 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 mb-2"
                  />


                  <button
                    type="submit"
                    className="bg-white text-black py-1 rounded text-lg mb-5"
                    style={{ fontFamily: "Roboto, sans-serif", width: "100%" }}
                    disabled={isSubmitting}
                  >
                    {loading ? (
                    <div className="flex justify-center items-center ">
                        <FaSpinner className="animate-spin text-xl m-1" />
                      </div>
                    ) : (
                    "Log in"
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="text-center text-sm">
              <p
                className="text-gray-400"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                <Link to="/forgetpass"> Forgot password?</Link>
              </p>
              <br />
              <p
                className="text-white"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                Don't have an account?{" "}
                <Link to="/register" className="font-bold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;
