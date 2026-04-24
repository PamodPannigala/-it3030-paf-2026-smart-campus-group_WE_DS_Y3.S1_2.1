// imageUpload.js

import axios from "axios";

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "campus_preset"); // උදා: campus_preset
  formData.append("cloud_name", "dqj9n46vq");

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dqj9n46vq/image/upload",
      formData,
    );
    return response.data.secure_url; // මෙන්න මෙතනින් තමයි අපිට URL එක ලැබෙන්නේ!
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
