import React, { ChangeEvent, useState } from "react";
import profileimg from "../images/Userlogo.png";
import axios from "axios";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import Clintnew from "../../Redux-store/Axiosinterceptor";
import { FaSpinner } from "react-icons/fa"; // Optional spinner icon


interface EditProfileModalProps {
  toggleModal: () => void;
  updateProfileState: () => void;
  userid: string | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  toggleModal,
  updateProfileState,
  userid,
}) => {
  // Define Yup validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
      .required("Name is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    newpassword: Yup.string()
      .min(8, "New password must be at least 8 characters long")
      .required("New password is required"),
  });
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
      newpassword: "",
      image: null as File | null,
    },

    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("password", values.password);
        formData.append("newpassword", values.newpassword);

        if (values.image) {
          formData.append("image", values.image);
        }
        if (userid) {
          formData.append("userId", userid);
        }
        setLoading(true);
        try {
          const { data } = await Clintnew.post(
            `http://localhost:3000/api/user/updateProfile`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (data.message === "userupdated successfully") {
            toast.success("Profile updated");
            updateProfileState();
            toggleModal();
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
        } finally {
          setLoading(true);
        }
      } catch (error) {
        console.log(error);
      }
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      formik.setFieldValue("image", e.target.files[0]);
    }
  };

  return (
    <div
      id="authentication-modal"
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Profile
            </h3>
            <button
              type="button"
              className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={toggleModal}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="p-4 md:p-5">
            <div className="flex justify-center mb-5">
              <img src={profileimg} alt="Logo" className="h-20 w-20" />
            </div>
            <form
              onSubmit={formik.handleSubmit}
              method="POST"
              encType="multipart/form-data"
              className="space-y-4 mt-5"
            >
              <div className="text-left mb-5">
                <input
                  type="file"
                  name="image"
                  required
                  onChange={handleImageChange}
                  className="text-left block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Enter your name"
                  required
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-red-500 text-sm">{formik.errors.name}</p>
                ) : null}
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your current password"
                  className="bg-gray-50 border mb-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-red-500 text-sm">
                    {formik.errors.password}
                  </p>
                ) : null}
              </div>
              <div>
                <input
                  type="password"
                  name="newpassword"
                  value={formik.values.newpassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your new password"
                  className="bg-gray-50 mb-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
                {formik.touched.newpassword && formik.errors.newpassword ? (
                  <p className="text-red-500 text-sm">
                    {formik.errors.newpassword}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin" /> : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
