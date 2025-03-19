import User from "../models/users.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUsernameProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const flowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    if (!userToModify || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res.status(200).json({ message: "Unfollowed" });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      // Send to notification
      const newNotification = new Notification({
        from: req.user._id,
        to: userToModify._id,
        type: "follow",
      });

      await newNotification.save();

      res.status(200).json({ message: "Followed" });
    }
  } catch (error) {
    console.log("Error in flow function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserSuggested = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFlowByMe = await User.findById(userId).select("following");
    const user = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = user.filter(
      (user) => !usersFlowByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 5);
    suggestedUsers.forEach((user) => {
      user.password = null;
    });
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getUserSuggested function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  let { fullname, username, email, bio, currentPassword, newPassword, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userID = req.user._id;

  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res.status(400).json({
        message: "You must provide both current password and new password",
      });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    console.log("profileImg", profileImg);

    if (profileImg) {
      console.log("123");
      if (user.profileImg) {
        await cloudinary.uploader
          .destroy(user.profileImg.split("/"))
          .pop()
          .split(".")[0];
      }
      const uploadResponse = await cloudinary.uploader(profileImg);
      profileImg = uploadResponse.url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader
          .destroy(user.coverImg.split("/"))
          .pop()
          .split(".")[0];
      }
      const uploadResponse = await cloudinary.uploader(coverImg);
      coverImg = uploadResponse.url;
    }
    user.fullname = fullname || user.fullname;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.link = link || user.link;
    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.log("Error in updateUser function", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
