
import mongoose, { Schema } from "mongoose";

const Post = mongoose.model("post", new Schema({
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
        required: true
    }],
    reply_to: { type: Schema.Types.ObjectId, ref: "Post", default: null },
    date: { type: Date, default: Date.now, required: true }
}));

export default Post;
