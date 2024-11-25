import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_API_KEY = "681785526541859";
const CLOUDINARY_API_SECRET = "RTTflP87TJvklyXyk0kZWG8QDoA";

cloudinary.config({
  cloud_name: "ds3uh3v2t",
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary;
