import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "10d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //Check if password is long enough

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //Check if username is long enough

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters long" });
    }

    //Check if user already exists

    //const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    //if (existingUser) {
    //return res.status(400).json({ message: 'User already exists' });
    //});

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: `Account with ${existingemail} already exists` });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: `Account with ${existingUsername} already exists` });
    }

    //Get random avatar from dicebear
    const profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });

    await user.save();

    const token = generateToken(user._id); // Function to generate JWT token

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error registering user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate input
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    //check if user exists

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    //check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    //Generate token
    const token = generateToken(user._id); // Function to generate JWT token

    //Send response
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error logging in user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
