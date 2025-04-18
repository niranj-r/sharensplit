// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ GET USER BY ID
router.get("/:userId", async (req, res) => {
  try {
    console.log("🔍 Fetching user with ID:", req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.warn("⚠️ No user found for ID:", req.params.userId);
      return res.json({ user: null });
    }
    res.json({ user });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error while fetching user." });
  }
});

// ✅ CREATE MINIMAL USER IF MISSING
router.post("/create", async (req, res) => {
  const { userId } = req.body;
  try {
    const existing = await User.findById(userId);
    if (existing) return res.json({ message: "User already exists." });

    const newUser = new User({ _id: userId, email: `generated_${Date.now()}@auto.com`, password: "" });
    await newUser.save();
    console.log("✅ Created fallback user:", newUser._id);
    res.status(201).json({ message: "Minimal user created." });
  } catch (err) {
    console.error("❌ Error creating fallback user:", err);
    res.status(500).json({ message: "Error creating fallback user." });
  }
});

module.exports = router;
