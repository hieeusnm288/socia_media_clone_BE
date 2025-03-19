import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/users.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let { img } = req.body;
    const userID = req.user._id.toString();

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!content && !img) {
      return res.status(400).json({ message: "Content or image is required" });
    }

    if (img) {
      const uploadResponse = await cloudinary.uploader(img);
      // img = uploadResponse.url;
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({
      user: userID,
      content,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "You are not delete this post" });
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Delete Success" });
  } catch (error) {
    console.log("Eroor in delete post controller", error);
    res.status(500).json({ error: "Internal server Eroor" });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = { user: userId, text };
    post.comment.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentPost: ", error);
    res.status(500).json({ error: "Internal Server Eroor" });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ eroor: "Post not found" });
    }
    // console.log(post);
    const userLikePost = post.liked.includes(userId);

    if (userLikePost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { liked: userId } });

      await User.updateOne({ _id: userId }, { $pull: { likePost: postId } });

      res.status(200).json({ message: "Unlike Post" });
    } else {
      //Like
      const newNotification = new Notification({
        from: req.user._id,
        to: post.user,
        type: "like",
      });
      await newNotification.save();
      post.liked.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likePost: postId } });

      await post.save();
      res.status(200).json({ message: "Like Post" });
    }
  } catch (error) {
    console.log("Eroor in LikePost: ", error);
    res.status(500).json({ eroor: "Internal Server Eroor" });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    console.log("Eroor in get AllPost ", error);
    res.status(500).json({ eroor: "Internal server eroor" });
  }
};

export const getLikePost = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const likePost = await Post.find({ _id: { $in: user.likePost } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "user.comment",
        select: "-password",
      });
    res.status(200).json({ likePost });
  } catch (error) {
    console.log("Error in getLikePost: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFlowPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ eroor: "User not found" });
    }
    const flowing = user.flowing;
    const feedPosts = await Post.find({ user: { $in: flowing } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });
    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Eroor in getFlowPost: ", error);
    res.status(500).json({ error: "Internal Server Eroor" });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ eroor: "User not found" });
    }
    const post = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });
    res.status(200).json(post);
  } catch (error) {
    console.log("Eroor in getUserPost: ", error);
    res.status(500).json({ error: "Internal Error Server" });
  }
};
