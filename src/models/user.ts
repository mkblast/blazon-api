import mongoose, { Schema } from "mongoose";

const User = mongoose.model("User", new Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    about: { type: String, default: "" },
    date: { type: Date, default: Date.now, required: true },
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
        required: true,
    }],
    profile_image: { type: String, required: true }
}));

export default User;
