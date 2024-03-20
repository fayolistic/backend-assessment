import mongoose from "mongoose";
import db from "../database/db";

interface IUser extends Document {
  authorName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

const UserSchema = new mongoose.Schema({
  authorName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
