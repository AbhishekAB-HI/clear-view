import "tailwindcss/tailwind.css";
import { FcGoogle } from "react-icons/fc";
import newlogo from "../images/newslogo.jpg";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import CryptoJS from "crypto-js";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

const Registerpage: React.FC = () => {
  
  const navigate = useNavigate();
  const [Emailerror, setEmailerror] = useState("");


  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .required("Name is required")
      .test(
        "is-not-only-spaces",
        "Name cannot be only spaces",
        (value) => !!value && value.trim().length > 0
      ),
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
    confirmpassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    const { name, email, password } = values;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/register",
        { name, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "OTP Send Successfully") {
        let email = response.data.useremail;
        const secretKey = "your-secret-key-crypto";
        const encryptedEmail = CryptoJS.AES.encrypt(
          email,
          secretKey
        ).toString();
        navigate("/verify-otp", { state: { email: encryptedEmail } });
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      } else {
        toast.error("Unknown error occurred");
      }
      console.error("Error verifying OTP:", error);


    }
  };

  return (
    <div>   
      <Navbar />
      <div className="flex flex-col md:flex-row h-screen">
        <div className="flex-1 bg-purple-700 flex justify-center items-center order-1 md:order-2 p-5 md:p-10">
          <img
            src={newlogo}
            alt="News illustration"
            className="w-full md:w-4/5 max-w-xs md:max-w-md rounded-lg"
          />
        </div>

        <div className="flex-1 bg-black text-white flex flex-col justify-center p-5 md:p-10 order-2 md:order-1">
          <div className="mt-10 text-center mb-5">
            <h2
              className="text-3xl md:text-3xl"
              style={{ fontFamily: "junge" }}
            >
              Your trusted source for <br /> the latest news and insights
            </h2>
          </div>

          <div className="flex flex-col mx-auto w-full md:w-3/4 ">
            <button className="flex items-center justify-center bg-white text-black py-2 rounded text-lg font-semibold space-x-2">
              <FcGoogle className="text-2xl" />
              <span style={{ fontFamily: "Roboto, sans-serif" }}>
                Sign up with Google
              </span>
            </button>
            <div
              className="text-center my-5 text-sm"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              or
            </div>

            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                confirmpassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    className="py-4 px-4 border bg-black rounded mb-5 md:mb-5 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif", height: "8%" }}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 mb-2"
                  />

                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter your Email"
                    className="py-4 px-4 border bg-black rounded mb-5 md:mb-5 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif", height: "8%" }}
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
                    className="py-4 px-4 border bg-black rounded mb-5 md:mb-5 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif", height: "8%" }}
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 mb-2"
                  />

                  <Field
                    type="password"
                    name="confirmpassword"
                    placeholder="Confirm your password"
                    className="py-4 px-4 border bg-black rounded  md:mb-10 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif", height: "8%" }}
                  />
                  <ErrorMessage
                    name="confirmpassword"
                    component="div"
                    className="text-red-500 mb-2"
                  />

                  {Emailerror && (
                    <h5 className="mb-2 text-left" style={{ color: "red" }}>
                      {Emailerror}
                    </h5>
                  )}

                  <button
                    type="submit"
                    className="bg-white text-black rounded text-lg"
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      height: "10%",
                      width: "100%",
                    }}
                    disabled={isSubmitting}
                  >
                    Sign up
                  </button>
                </Form>
              )}
            </Formik>

            <div className="text-center text-sm mt-2 ">
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
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registerpage;
