import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import User from "../models/user";

passport.use(
    new Strategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET!,
        },

        async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id).exec();

                if (user) {
                    return done(null, user);
                }

                return done(null, false);
            } catch (err) {
                return done(err, false);
            }
        }

    )
);
