import { v2 as cloudinary } from "cloudinary";
import envConfig from "../config/index.ts";
import fs from "fs";
import type { ICloudinary } from "../interfaces/cloudinary.ts";
import type { IFile } from "../interfaces/file.ts";

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY.CLOUD_NAME,
  api_key: envConfig.CLOUDINARY.API_KEY,
  api_secret: envConfig.CLOUDINARY.API_SECRET,
});

// export const uploadToCloudinary = async (filePath: string, folder: string) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//         folder: folder,
//     });
//     return result;
//   } catch (error) {
//     throw error;
//   }
// };

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

export const uploadImageToCloudinary = async (
  file: IFile,
  folder: string = "AK-HealthCare",
  publicId?: string
): Promise<string | undefined | null> => {
  const options: {
    folder: string;
    public_id?: string;
    overwrite?: boolean;
  } = {
    folder: folder,
  };

  if (publicId) {
    options.public_id = publicId;
    options.overwrite = true;
  }

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(file.path, options);
    if (!result) return null;

    // after upload,delete the local file
    fs.unlinkSync(file.path);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(file.path);
    console.error(error);
    return null;
  }
};
