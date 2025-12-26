import { v2 as cloudinary } from "cloudinary";
import envConfig from "../config/index.js";
import fs from "fs";
import type { ICloudinary } from "../interfaces/cloudinary.js";
import type { IFile } from "../interfaces/file.js";

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY.CLOUD_NAME,
  api_key: envConfig.CLOUDINARY.API_KEY,
  api_secret: envConfig.CLOUDINARY.API_SECRET,
});

// extract public id from cloudinary url
export const getCloudinaryPublicId = (input: string): string | null => {
  try {
    if (!input || typeof input !== "string") return null;

    // Accept:
    // 1) Full Cloudinary URL:
    //    https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg
    // 2) URL without protocol (rare but happens):
    //    res.cloudinary.com/<cloud>/image/upload/v123/folder/name.jpg
    // 3) Stored "path-like" value (your case):
    //    <cloud>/image/upload/v123/folder/name
    // 4) Already-a-publicId:
    //    folder/name

    let s = input.trim();

    // If it's a full URL (or protocol-less URL), use URL parsing to grab pathname
    const isHttpUrl = /^https?:\/\//i.test(s);
    const isResCloudinary = /res\.cloudinary\.com/i.test(s);

    if (isHttpUrl && isResCloudinary) {
      const urlObj = new URL(s);
      s = urlObj.pathname; // e.g. /<cloud>/image/upload/v123/folder/name.jpg
    } else if (!isHttpUrl && isResCloudinary) {
      // make it parseable by URL()
      const urlObj = new URL(`https://${s}`);
      s = urlObj.pathname;
    }

    // Normalize to a simple path (remove leading slashes)
    s = s.replace(/^\/+/, "");

    // Remove optional "<cloudName>/" prefix if present
    // examples:
    //   dqxjhomqb/image/upload/v123/...  -> image/upload/v123/...
    //   <cloud>/video/upload/...         -> video/upload/...
    s = s.replace(/^[^/]+\//, (m) => {
      // Only drop the first segment if the remaining starts with a known resource type
      const rest = s.slice(m.length);
      return /^(image|video|raw)\/upload\//.test(rest) ? "" : m;
    });

    // Remove resource type + upload + optional transformations + optional version
    // Handles:
    // - image/upload/v123/...
    // - image/upload/c_fill,w_200/v123/...
    // - image/upload/c_fill,w_200/...
    s = s.replace(/^(image|video|raw)\/upload\/([^/]+\/)*v?\d+\//, "");
    s = s.replace(/^(image|video|raw)\/upload\/([^/]+\/)*/, ""); // fallback if no version

    // Drop query/hash if any (in case input was not parsed as URL)
    s = (s.split("?")[0] || "").split("#")[0] || "";

    // Remove file extension (jpg/png/webp/etc)
    s = s.replace(/\.[^/.]+$/, "");

    return s.length ? s : null;
  } catch (error) {
    console.error("Invalid Cloudinary input:", error);
    return null;
  }
};

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
