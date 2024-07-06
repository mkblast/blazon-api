import { NextFunction, Request, Response, Router } from "express";
import User from "../../models/user";
import Post from "../../models/post";
import { validateId } from "../../utiles";
import { body, validationResult } from "express-validator";
import { stat } from "fs";

const usersRouter = Router();

usersRouter.get("/users", async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $nin: [req.user?._id] } }, "-email -password").exec();

        return res.status(200).json({
            status: "Query succeed.",
            users,
        });
    } catch (err) {
        next(err);
    }
});

usersRouter.get("/users/:userId",
    validateId,

    async (req, res, next) => {
        try {
            const user = await User.findById(req.params.userId, "-email -password").exec();

            if (user === null) {
                return res.status(404).json({
                    status: "Query failed.",
                    errors: [{
                        msg: "User not found."
                    }]
                });
            }

            return res.status(200).json({
                status: "Query succeed.",
                user,
            });
        } catch (err) {
            next(err);
        }
    }
);

usersRouter.get("/users/:userId/posts/",
    validateId,

    async (req, res, next) => {
        try {
            const replyCondition = req.query.replies === "true" ? {} : { reply_to: null };
            const { userId } = req.params;
            const posts = await Post.find({
                author: userId,
                ...replyCondition
            })
                .populate([{ path: "author", select: "-email -password" }])
                .sort({ date: -1 })
                .exec();

            return res.status(200).json({
                status: "Query succeed.",
                posts,
            });

        } catch (err) {
            next(err);
        }
    }
);

async function userExists(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await User.findOne({ _id: req.params.userId }).exec();

        if (user === null) {
            return res.status(404).json({
                status: "Operation failed.",
                errors: [{
                    msg: "User not found",
                }]
            });
        }

        return next();
    } catch (err) {
        next(err);
    }

}

usersRouter.post("/users/:userId/follow/",
    validateId,

    userExists,

    async (req, res, next) => {
        try {
            const { userId } = req.params;

            if (userId === req.user?._id) {
                return res.status(400).json({
                    status: "Opetation succeed.",
                    errors: [{ msg: "Cannot follow yourself" }]
                });
            }

            const user = await User.findOneAndUpdate(
                { _id: req.user?._id },
                { $addToSet: { following: userId } },
                { new: true, fields: "-password -email" }
            );

            return res.status(200).json({
                status: "Operation succeed.",
                user,
            });

        } catch (err) {
            next(err);
        }
    }
);

usersRouter.delete("/users/:userId/follow/",
    validateId,

    userExists,

    async (req, res, next) => {
        try {
            const { userId } = req.params;

            if (userId === req.user?._id) {
                return res.status(400).json({
                    status: "Opetation succeed.",
                    errors: [{ msg: "Cannot unfollow yourself" }]
                });
            }

            const user = await User.findOneAndUpdate(
                { _id: req.user?._id },
                { $pull: { following: userId } },
                { new: true, fields: "-password -email" }
            );

            return res.status(200).json({
                status: "Operation succeed.",
                user,
            });

        } catch (err) {
            next(err);
        }
    }
);

export default usersRouter;
