import React, { useEffect, useState } from "react";
import { FaImage, FaVideo, FaSmile } from "react-icons/fa";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import toast from "react-hot-toast";
import Clintnew from "../../Redux-store/Axiosinterceptor";
interface EditPostModalProps {
  toggleeditpostModal: () => void;
  postid: string | null;
}

const EditPostModal = ({ toggleeditpostModal, postid } : EditPostModalProps) => {

  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postVideos, setPostVideos] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

   useEffect(() => {
     console.log("img", postImages);
     console.log("content", postContent);
     console.log("video", postVideos);
     console.log("emoji", showEmojiPicker);
   }, [postImages, postContent, postVideos]);

  const handlePostSubmit = async () => {
    console.log("Submitting Post...");
    console.log("Post Content:", postContent);
    console.log("Post Images:", postImages);
    console.log("Post Videos:", postVideos);

    const formData = new FormData();
    formData.append("content", postContent);

    postImages.forEach((image) => {
      formData.append("images", image);
    });

    postVideos.forEach((video) => {
      formData.append("videos", video);
    });

    formData.append("postId", postid || "");

    try {
      const response = await Clintnew.post(
        "http://localhost:3000/api/user/editpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message === "Post updated successfully") {
        toast.success("Post updated successfully");
        toggleeditpostModal();
      }
      console.log("Update Successful:", response.data);
    } catch (error) {
      console.log("Error updating post:", error);
    }
  };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (files && files.length > 0) {
       setPostImages((prevImages) => [...prevImages, ...Array.from(files)]);
     }
   };

  

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPostVideos((prevVideos) => [...prevVideos, ...Array.from(files)]);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setPostContent((prevContent) => prevContent + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleImageRemove = (index: number) => {
    setPostImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleVideoRemove = (index: number) => {
    setPostVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full relative text-white">
        <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

        <textarea
          className="w-full p-3 bg-gray-900 text-white mb-4 border border-gray-600 rounded"
          rows={6}
          placeholder="What's happening?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        ></textarea>

        {/* Image and Video Upload */}
        <div className="mb-4">
          {/* Display multiple images */}
          {postImages.length > 0 && (
            <div className="mb-2">
              {postImages.map((image, index) => (
                <div key={index} className="relative inline-block mr-2 mb-2">
                  <img
                    src={URL.createObjectURL(image)}
                    alt='preview'
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-1 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Display multiple videos */}
          {postVideos.length > 0 && (
            <div className="mb-2">
              {postVideos.map((video, index) => (
                <div key={index} className="relative inline-block mr-2 mb-2">
                  <video
                    src={URL.createObjectURL(video)}
                    controls
                    className="w-32 h-32 object-cover rounded-lg"
                  ></video>
                  <button
                    onClick={() => handleVideoRemove(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-1 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="upload-image" className="cursor-pointer">
              <FaImage className="text-xl hover:text-blue-500" />
              <input
                type="file"
                id="upload-image"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <label htmlFor="upload-videos" className="cursor-pointer">
              <FaVideo className="text-xl hover:text-blue-500" />
              <input
                type="file"
                id="upload-videos"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="hidden"
              />
            </label>

            <FaSmile
              className="text-xl hover:text-blue-500 cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded"
              onClick={toggleeditpostModal} >
              Cancel
            </button>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handlePostSubmit}
            >
              Update Post
            </button>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPostModal;
