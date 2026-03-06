const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

/* ================= IMAGE STORAGE ================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

/* ================= CREATE POST ================= */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.create({
      title,
      content,
      image: req.file?.path || "",
      likes: 0, // ✅ FIX: use number instead of array
      likedBy: [], // track devices
      comments: []
    });

    res.json(post);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= GET POSTS ================= */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= UPDATE POST ================= */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;

    let data = { title, content };

    if (req.file) {
      data.image = req.file.path;
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json("Deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= LIKE / UNLIKE ================= */

router.put("/like/:id", async (req, res) => {
  try {

    const io = req.app.get("io");

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    // increase like
    post.likes += 1;

    await post.save();

    io.emit("postLiked", post);

    res.json(post);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ================= COMMENT ================= */
router.post("/comment/:id", async (req, res) => {
  try {
    const { user, text } = req.body;
    const io = req.app.get("io");

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    const comment = { user, text };

    post.comments.push(comment);
    await post.save();

    io.emit("newComment", {
      postId: post._id,
      comment
    });

    res.json(post);

  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;