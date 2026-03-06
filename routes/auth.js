const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================= CHECK ADMIN ================= */

router.get("/check-admin", async (req, res) => {

  const admin = await User.findOne({ role: "admin" });

  if (admin) {
    res.json({ adminExists: true });
  } else {
    res.json({ adminExists: false });
  }

});


/* ================= ADMIN SIGNUP ================= */

router.post("/signup", async (req, res) => {

  try {

    const { username, email, password } = req.body;

    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      return res.status(400).json("Admin already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.json(user);

  } catch (error) {
    res.status(500).json(error.message);
  }

});


/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json("User not found");

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json("Wrong password");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "60d" }
    );

    res.json({ user, token });

  } catch (error) {
    res.status(500).json(error.message);
  }

});

module.exports = router;