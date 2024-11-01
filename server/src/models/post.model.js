import mongoose, { Schema } from "mongoose";

const postschema = new Schema(
  {
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
        type: String,
        required: true,
      },
    image:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    status:{
        type: Boolean,
        required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postschema);
