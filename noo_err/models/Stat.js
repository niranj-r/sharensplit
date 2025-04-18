const mongoose = require("mongoose");

const statSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.Mixed, // Can handle ObjectId or string
  person: String,
  totalPaid: Number,
  totalSpent: Number,
  totalReceived: Number
}, { timestamps: true }); // 👈 Important for createdAt/updatedAt

module.exports = mongoose.model("Stat", statSchema);
