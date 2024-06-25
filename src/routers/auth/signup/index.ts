import { Router } from "express";
import { body, validationResult } from "express-validator";
import { hash } from "bcryptjs";
import User from "../../../models/user";
import { generateProfilePic } from "../../../utiles";

const signupRouter = Router();

signupRouter.post("/signup",
    body("username")
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage("Username: field must be between 5 and 20 characters.")
        .custom(value => {
            const regex = /^(?=([^a-zA-Z]*[a-zA-Z]){3})[a-zA-Z0-9._-]{5,20}$/;
            const result = regex.test(value);

            if (!result) {
                throw new Error("Username: characters not allowed");
            }

            return true;
        })
        .customSanitizer(value => `@${value}`),

    body("name")
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage("Name: field must be between 1 and 20 characters."),

    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Email: field must not be empty.")
        .isEmail()
        .withMessage("Email: field must be a valid email."),

    body("password")
        .trim()
        .isLength({ min: 8, max: 50 })
        .withMessage(("Password: field must be between 8 and 20 characters.")),

    async (req, res, next) => {
        try {
            const results = validationResult(req);
            if (!results.isEmpty()) {
                return res.status(400).json({
                    status: "Input validation failed.",
                    errors: results.array()
                });
            }

            const { username, name, email, password } = req.body;

            const [usernameExists, emailExists] = await Promise.all([
                User.findOne({ username }).exec(),
                User.findOne({ email }).exec(),
            ]);

            if (usernameExists) {
                return res.status(400).json({
                    status: "Input validation failed.",
                    errors: [{ msg: "User with the same username already exists" }]
                });
            }

            if (emailExists) {
                return res.status(400).json({
                    status: "Input validation failed.",
                    errors: [{ msg: "User with the same email already exists" }]
                });
            }

            const hashedPassword = await hash(password, 10);
            const profileImage = generateProfilePic(email, 200);

            const user = new User({
                username,
                name,
                email,
                password: hashedPassword,
                profile_image: profileImage,
            });

            await user.save();

            return res.status(200).json({
                status: "User has been created succesfully",
                user
            });
        } catch (err) {
            next(err);
        }
    }
);

export default signupRouter;
