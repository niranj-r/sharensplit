// routes/stats.js
const express = require("express");
const router = express.Router();
const Stat = require("../models/Stat");
const mongoose = require("mongoose");

// POST /api/stats/save
router.post("/save", async (req, res) => {
  try {
    const stats = req.body;
    console.log("📦 Incoming stat data:", stats);

    if (!Array.isArray(stats) || stats.length === 0) {
      return res.status(400).json({ message: "No stats provided" });
    }

    const formattedStats = stats.map(s => ({
      userId: s.userId,
      person: s.person,
      totalPaid: parseFloat(s.totalPaid),
      totalSpent: parseFloat(s.totalSpent),
      totalReceived: parseFloat(s.totalReceived),
    }));

    console.log("🛠 Saving to DB:", formattedStats);

    const saved = await Stat.insertMany(formattedStats);
    console.log("✅ Stats saved:", saved);

    res.status(200).json({ message: "Stats saved", saved });
  } catch (error) {
    console.error("❌ Error saving stats:", error);
    res.status(500).json({ message: "Failed to save stats", error });
  }
});

// POST /api/stats/history
router.post("/history", async (req, res) => {
  const { userId } = req.body;
  console.log("📩 Received userId:", userId);

  // Check if userId exists
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    // Handle the userId without trying to convert it to ObjectId
    // This resolves the issue if userId is not in a valid ObjectId format
    let query = { userId: userId };
    
    // Only try to convert to ObjectId if it appears to be in valid format
    // This avoids the 500 error when passing a non-ObjectId string
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        query = { userId: new mongoose.Types.ObjectId(userId) };
      } catch (e) {
        console.log("Not a valid ObjectId format, using as string");
      }
    }

    console.log("🔍 Query:", query);
    const stats = await Stat.find(query);
    console.log("📦 Found stats:", stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error loading stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;