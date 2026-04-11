import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,   // base64 data URL or empty
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
