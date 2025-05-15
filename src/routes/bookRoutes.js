import express from "express";
import cloudinary from "cloudinary";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, image, rating } = req.body;

    //check if all fields are filled
    if (!title || !caption || !image || !rating)
      return res.status(400).json({ message: "All fields are required" });

    //Upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    //Save image to database

    const newBook = new Book({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id, // Import user from auth middleware
    });

    await newBook.save();

    res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

//fetch all books
//pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
  try {
    // Sending response from React Native frontend
    //const response = await fetch("http://localhost:5000/api/books?page=1&limit=5");
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const book = await Book.find()
      .sort({ createdAt: -1 }) //sort in descending order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.send({
      book,
      currentPage: page,
      totalBooks,
      totalPage: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error fetching books", error);
    res.status(500).json({ message: error.message });
  }
});

//fetch all recommended book by logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ books });
  } catch (error) {
    console.log("Error fetching user books", error);
    res.status(500).json({ message: error.message });
  }
});

//delete image
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    // Check if the book exists by id
    const book = await Book.findbyId(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Check if the user is the owner of the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this book" });
    }

    // Delete image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        //https://res.cloudinary.com/dqj8v4x5g/image/upload/v1698231234/Book/1.jpg
        //split the url to get the public id
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
        return res
          .status(500)
          .json({ message: "Error deleting image from cloudinary" });
      }
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
