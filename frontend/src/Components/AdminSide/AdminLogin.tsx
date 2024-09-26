import "tailwindcss/tailwind.css";
import { FcGoogle } from "react-icons/fc";
import newlogo from "../images/newslogo.jpg";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAdminAccessTocken } from "../../Redux-store/redux-slice";
const AdminLoginpage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

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


     




  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/admin/adminlogin",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.message === "adminLogin succesfully") {

        console.log(data.AdminTocken,'admintoc............');
        
        dispatch(setAdminAccessTocken(data.AdminTocken));
        toast.success('Admin Logined successfully');
        navigate("/Adminhome");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        toast.error(errorMessage);
      } else {
        toast.error("Unknown error occurred");
      }
      console.error("Error during login:", error);
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

          <div className="mb-10 text-center">
            <h2
              className="text-3xl md:text-3xl"
              style={{ fontFamily: "junge" }}
            >
              ADMIN LOGIN
            </h2>
          </div>

          <div className="flex flex-col mx-auto w-full md:w-3/4">
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-5 md:mb-10">
                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      className="py-3 px-4 border bg-black rounded text-lg w-full"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-5 md:mb-10">
                    <Field
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="py-3 px-4 border bg-black rounded text-lg w-full"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-white text-black py-1 rounded text-lg mb-5 w-full"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : "Log in"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLoginpage;
