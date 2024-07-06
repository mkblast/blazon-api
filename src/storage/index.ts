import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user?._id}-profile-img${ext}`);
    }
});

const upload = multer({storage});

export {cloudinary, upload};
