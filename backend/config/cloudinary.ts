import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    console.log("✅ Connected to Cloudinary successfully");
  } catch (error) {
    console.error("❌ Cloudinary connection error:", error);
    console.log("Can't connect to Cloudinary");
  }
};
