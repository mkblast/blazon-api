import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import "./config/db";
import "./config/passport";
import signupRouter from "./routers/auth/signup";
import loginRouter from "./routers/auth/login";
import postRouter from "./routers/main/posts";
import meRouter from "./routers/main/me";
import passport from "passport";
import usersRouter from "./routers/main/users";
import httpErrors from "http-errors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/auth", signupRouter);
app.use("/api/auth", loginRouter);

app.use("/api/main/*",
    passport.authenticate("jwt", { session: false, failWithError: true }),
    (err: ResError, req: Request, res: Response, next: NextFunction) => {
        return res.status(401).json({
            status: err.name,
            errors: [{ msg: err.message }]
        });
    },
);

app.use("/api/main", postRouter, usersRouter, meRouter);

app.use("/api/*", (req, res, next) => {
    next(httpErrors(404, "Route not found."));
});

app.use((err: ResError, req: Request, res: Response, next: NextFunction) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500).json(err);
});

app.listen(3000, () => console.log("server started at http://localhost:3000"));
