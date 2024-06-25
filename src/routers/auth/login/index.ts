import { Router } from "express";
import { body, validationResult } from "express-validator";
import User from "../../../models/user";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const loginRouter = Router();

loginRouter.post("/login",
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Email: must provide email.")
        .isEmail()
        .withMessage("Email: field must be a valid email."),

    body("password")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Password: must provide password"),

    async (req, res, next) => {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({
                    status: "Input validation failed.",
                    errors: result.array(),
                });
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email }).exec();

            if (!user) {
                return res.status(404).json({
                    status: "Login failed",
                    errors: [{
                        msg: "User not found."
                    }]
                });
            }

            const match = await compare(password, user.password);

            if (!match) {
                res.status(404).json({
                    status: "Login failed",
                    errors: [{
                        msg: "Password is incorrect."
                    }]
                });
            }

            const JWT_SECRET = process.env.JWT_SECRET;

            const token = sign(
                { id: user._id },
                JWT_SECRET!,
                { expiresIn: 60 * 60 * 24 * 30 }
            );

            return res.status(200).json({ status: "Log in succeeded.", token });
        } catch (err) {
            next(err);
        }
    }
);

export default loginRouter;
