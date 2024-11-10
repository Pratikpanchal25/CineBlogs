import e, { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware.js"
import { createPost, getAllPosts, getAllPostsOfUser, getPostById } from "../controllers/post.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
const postRouter = Router()

postRouter.route("/create").post(authenticateToken, createPost)
postRouter.route("/get-posts").get(authenticateToken, getAllPosts)
postRouter.route("/get-userposts").get(authenticateToken, getAllPostsOfUser)
postRouter.route("/get-post/:id").get(getPostById)

export default postRouter