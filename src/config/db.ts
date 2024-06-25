import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
    await mongoose.connect(MONGODB_URI);
}

main().catch(err => console.log(err));
