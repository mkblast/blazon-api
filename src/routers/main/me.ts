import { Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../../models/user";
import { cloudinary, upload } from "../../storage/index";
import { stat } from "fs";

const meRouter = Router();

meRouter.get("/me", (req, res) => {
    return res.status(200).json({
        status: "Qeuery succeed",
        me: req.user
    });
});



meRouter.post("/me",
    body("about")
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage("About: must be between 1 and 500 characters."),

    async (req, res, next) => {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({
                    status: "Input validation failed.",
                    errors: [result.array()]
                });
            }

            const { about } = req.body;

            const user = await User.findOneAndUpdate(
                { _id: req.user?._id },
                { about },
                { new: true }
            ).select("-password -email");

            return res.status(200).json({
                status: "Operation succeed.",
                user,
            });
        } catch (err) {
            next(err);
        }
    }
);

meRouter.post("/me/profile_image", upload.single("profile_image"),
    async (req, res, next) => {
        try {
            if (req.file === undefined) {
                return res.status(400).json({
                    status: "Operation failed",
                    errors: [{ msg: "File not Found" }],
                })
            }

            if (req.file.size > 4000000) {
                return res.status(400).json({
                    status: "Operation failed",
                    errors: [{ msg: "file should be smalled than 4mg" }],
                });
            }

            const img = await cloudinary.uploader.upload(req.file.path)

            const user = await User.findOneAndUpdate(
                { _id: req.user?._id },
                { profile_image: img.secure_url },
                { new: true }
            ).select("-password -email");

            return res.status(200).json({
                status: "Profile image uploaded",
                user,
            });
        } catch (err) {
            next(err);
        }
    }
)

export default meRouter;
