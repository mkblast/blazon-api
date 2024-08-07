import { NextFunction, Request, Response, Router } from "express";
import Post from "../../models/post";
import { body, validationResult } from "express-validator";
import { validateId } from "../../utiles";

const postRouter = Router();

postRouter.get("/posts", async (req, res, next) => {
    try {
        const posts = await Post.find({
            $and: [
                {
                    $or: [
                        { author: { $in: req.user?.following } },
                        { author: req.user?._id },
                    ]
                },
                {
                    reply_to: null
                }
            ]
        })
            .populate([{ path: "author", select: "-email -password" }])
            .sort({ date: -1 });

        return res.status(200).json({
            status: "Query succsed.",
            posts,
        });
    } catch (err) {
        next(err);
    }
});

postRouter.get("/posts/all", async (req, res, next) => {
    try {
        const posts = await Post.find({ reply_to: null })
            .populate([{ path: "author", select: "-email -password" }])
            .sort({ date: -1 });

        return res.status(200).json({
            status: "Query succsed.",
            posts,
        });
    } catch (err) {
        next(err);
    }
});

postRouter.get("/posts/:postId",
    validateId,

    async (req, res, next) => {
        try {
            const { postId } = req.params;
            const post = await Post.findOne({ _id: postId })
                .populate([{ path: "author", select: "-email -password" }])
                .exec();

            if (post === null) {
                return res.status(404).json({
                    status: "Query failed.",
                    errors: [{
                        msg: "Post not found."
                    }],
                });
            }

            return res.status(200).json({
                status: "Query succsed.",
                post,
            });

        } catch (err) {
            next(err);
        }
    });

postRouter.get("/posts/:postId/replies",
    validateId,

    async (req, res, next) => {
        try {
            const { postId } = req.params;
            const replies = await Post.find({ reply_to: postId })
                .populate([{ path: "author", select: "-email -password" }])
                .exec();

            return res.status(200).json({
                status: "Query succsed.",
                replies,
            });

        } catch (err) {
            next(err);
        }
    });

postRouter.post("/posts",
    body("body")
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage("Post: must not be empty or exceed 500 chracter"),

    async (req, res, next) => {
        try {
            const result = validationResult(req);
            if (result.isEmpty() === false) {
                return res.status(400).json({
                    status: "Posting failed: input validation error.",
                    errors: result.array(),
                });
            }

            const { body } = req.body;

            const post = await (new Post({
                body,
                author: req.user?._id,
            }).populate([{ path: "author", select: "-email -password" }]));

            await post.save();

            return res.status(200).json({
                status: "Posting succeed.",
                post,
            });

        } catch (err) {
            next(err);
        }
    }
);

postRouter.post("/posts/:postId/replies",
    validateId,

    body("body")
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage("Post: must not be empty or exceed 500 chracter"),

    async (req, res, next) => {
        try {
            const results = validationResult(req);
            if (results.isEmpty() === false) {
                return res.status(400).json({
                    status: "Posting failed: input validation error.",
                    errors: results.array(),
                });
            }

            const { body } = req.body;
            const { postId } = req.params!;

            const post = await (new Post({
                body,
                author: req.user?._id,
                reply_to: postId
            }).populate([{ path: "author", select: "-email -password" }]));

            await post.save();

            return res.status(200).json({
                status: "Posting succeed.",
                post,
            });

        } catch (err) {
            next(err);
        }
    }
);

async function checkAuthor(req: Request, res: Response, next: NextFunction) {
    try {
        const post = await Post.findOne({ _id: req.params.postId });

        if (post === null) {
            return res.status(404).json({
                status: "Operation failed.",
                errors: [{
                    msg: "post not found."
                }]
            });

        }

        const match = post._id.equals(req.user?._id);

        if (match === false) {
            return res.status(404).json({
                status: "Operation failed.",
                errors: [{
                    msg: "Not autherzied."
                }]
            });
        }

        return next();
    } catch (err) {
        next(err);
    }
}

postRouter.put("/posts/:postId",
    validateId,

    checkAuthor,

    body("body")
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage("Post: must not be empty or exceed 500 chracter"),

    async (req, res, next) => {
        try {
            const results = validationResult(req);
            if (results.isEmpty() === false) {
                return res.status(400).json({
                    status: "Posting failed: input validation error.",
                    errors: results.array(),
                });
            }

            const { postId } = req.params!;
            const { body } = req.body;

            const post = await Post.findOneAndUpdate(
                { _id: postId, author: req.user?._id },
                { body },
                { new: true }
            );

            return res.status(200).json({
                status: "Updating succeed.",
                post,
            });

        } catch (err) {
            console.log(err);
            next(err);
        }
    }
);

postRouter.delete("/posts/:postId",
    validateId,

    checkAuthor,

    async (req, res, next) => {
        try {
            const { postId } = req.params!;

            const post = await Post.findOneAndUpdate({ _id: postId }).exec();

            return res.status(200).json({
                status: "Deleting succeed.",
                post,
            });

        } catch (err) {
            console.log(err);
            next(err);
        }
    }
);



postRouter.post("/posts/:postId/like",
    validateId,

    async (req, res, next) => {
        try {
            const { postId } = req.params;
            const post = await Post.findOneAndUpdate(
                { _id: postId },
                { $addToSet: { likes: req.user?._id } },
                { new: true }
            ).populate([{ path: "author", select: "-email -password" }]);

            if (post === null) {
                return res.status(404).json({
                    status: "Operation failed.",
                    errors: [{
                        msg: "Post not found."
                    }],
                });
            }


            return res.status(200).json({
                status: "Operation succeed",
                post,
            });

        } catch (err) {
            next(err);
        }
    }
);

postRouter.delete("/posts/:postId/like",
    validateId,

    async (req, res, next) => {
        try {
            const { postId } = req.params;
            const post = await Post.findOneAndUpdate(
                { _id: postId },
                { $pull: { likes: req.user?._id } },
                { new: true }
            ).populate([{ path: "author", select: "-email -password" }]);

            if (post === null) {
                return res.status(404).json({
                    status: "Operation failed.",
                    errors: [{
                        msg: "Post not found."
                    }],
                });
            }

            return res.status(200).json({
                status: "Operation succeed",
                post,
            });

        } catch (err) {
            next(err);
        }
    }
);

export default postRouter;
