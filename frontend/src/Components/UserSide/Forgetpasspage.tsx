import "tailwindcss/tailwind.css";
import newlogo from "../images/newslogo.jpg";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import CryptoJS from "crypto-js";

const ForgetPassPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const encryptedEmail = location.state?.email;
  const secretKey = "your-secret-key-crypto";
  const bytes = CryptoJS.AES.decrypt(encryptedEmail, secretKey);
  const email = bytes.toString(CryptoJS.enc.Utf8);

  const validationSchema = Yup.object().shape({
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

  const handlesubmit = async (values: {
    password: string;
    confirmpassword: string;
  }) => {
    const { password } = values;
    const dataget = { password, email };

    try {
      const { data } = await axios.patch(
        "http://localhost:3000/api/user/setforgetpass",
        dataget,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.message === "Password Changed successfully") {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
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
          <div className="mb-5 text-center"></div>

          <div className="mb-5 text-center">
            <h2
              className="text-3xl md:text-3xl"
              style={{ fontFamily: "junge" }}
            >
              Your trusted source for <br /> the latest news and insights
            </h2>
          </div>

          <div className="flex flex-col mx-auto w-full md:w-3/4">
            <Formik
              initialValues={{ password: "", confirmpassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handlesubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Enter your new password"
                    className="py-3 px-4 border bg-black rounded mb-5 md:mb-10 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 mb-2"
                  />

                  <Field
                    type="password"
                    name="confirmpassword"
                    placeholder="Confirm your new password"
                    className="py-3 px-4 border bg-black rounded mb-5 md:mb-10 text-lg w-full"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  />
                  <ErrorMessage
                    name="confirmpassword"
                    component="div"
                    className="text-red-500 mb-2"
                  />

                  <button
                    type="submit"
                    className="bg-white text-black py-1 rounded text-lg mb-5"
                    style={{ fontFamily: "Roboto, sans-serif", width: "100%" }}
                    disabled={isSubmitting}
                  >
                    Submit
                  </button>
                </Form>
              )}
            </Formik>
            <div className="text-center text-sm">
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

export default ForgetPassPage;
