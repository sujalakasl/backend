import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers("Authorization").replace("Bearer ", "");

    if (!token)
      return res
        .status(401)
        .json({ message: "No token provided. Access denied" });

    //verify token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //find user by id

    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ message: "Invalid token. Access denied" });

    req.user = user; // Attach user to request object

    next(); // Call the next middleware or route handler if everything is successful
  } catch (error) {
    console.log("Error in auth middleware", error);
    res.status(500).json({ message: error.message });
  }
};

export default protectRoute;
