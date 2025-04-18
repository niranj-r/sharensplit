const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require('axios');

const User = require("./models/User");
const Stat = require("./models/Stat"); // ✅ Import Stat model
EMAIL_USER="niranj.njai@gmail.com"; // Sender Email
EMAIL_PASS="xwrcfaxgehjplpoz"; // Use App Password
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, // Must be the App Password!
  },
});

// **Function to Send Emails**
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Sharensplit" <${EMAIL_USER}>`,
      to,
      subject,
      html, // Change text to html for rich formatting
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

// ✅ Route: Fetch Stats History
app.post("/api/stats/history", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    const stats = await Stat.find({ userId }); // ✅ Using Mongoose model
    res.json(stats);
  } catch (error) {
    console.error("❌ Error loading stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body; // Destructure name, email, and password
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed }); // Save name in the user document
    await user.save();

    sendEmail(email, "🎉 Welcome to Sharensplit – Let’s Get Started!", `
      <p>Hello <b>${name}</b>,</p>
    
      <p>Welcome to <b>Sharensplit</b>! We're thrilled to have you join our community. 🎊</p>
    
      <p>With Sharensplit, you can effortlessly track and split expenses with friends, making cost-sharing seamless and stress-free.</p>
    
      <p><b>✨ Here’s what you can do:</b></p>
      <ul>
        <li>👥 <b>Add Friends & Create Groups:</b> Organize expenses for trips, outings, or shared costs.</li>
        <li>💰 <b>Log Expenses with Ease:</b> Enter expenses and choose how to split them.</li>
        <li>📊 <b>Clear Expense Breakdowns:</b> Get transparent reports and settle up hassle-free.</li>
        <li>⚡ <b>Smart Splitting Options:</b> Divide costs equally, by shares, exact amounts, or percentages.</li>
      </ul>
    
      <p>💡 <b>Get started now and make expense sharing effortless!</b></p>
    
      <p>If you have any questions, feel free to reach out to us at <a href="mailto:sharensplit.sn@gmail.com">sharensplit.sn@gmail.com</a>.</p>
    
      <p>Happy sharing! 😊</p>
    
      <p>Best Regards,</p>
      <p>💙 <b>The ShareNSplit Team</b></p>
    `);

    console.log("✅ User created:", user._id);
    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ message: "Signup failed. Server error." });
  }
});



// ✅ Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // Get user IP
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // Fetch location data based on IP
        let locationInfo = "Unknown Location";
        try {
          const response = await axios.get(`http://ip-api.com/json/${userIP}`);
          if (response.data.status === "success") {
            locationInfo = `${response.data.city}, ${response.data.regionName}, ${response.data.country}`;
          }
        } catch (error) {
          console.error("❌ Location Fetch Error:", error);
        }

    // Send Login Email with IP & Location
    sendEmail(email, "🔐 Login Alert – Your Sharensplit Account Activity", `
      <p>Hello <b>${user.name}</b>,</p>
      <p>We noticed a login to your Sharensplit account just now. If this was you, there's nothing to worry about! 🎉</p>
      <p><b>Login Details:</b></p>
      <ul>
        <li>📅 <b>Date & Time:</b> ${new Date().toLocaleString()}</li>
        <li>🌍 <b>IP Address:</b> ${userIP}</li>
        <li>📍 <b>Location:</b> ${locationInfo}</li>
      </ul>
      <p>If this login was not made by you, we strongly recommend taking the following steps to secure your account immediately:</p>
      <ul>
        <li>🔹 <b>Change Your Password:</b> Update your password to a strong and unique one.</li>
        <li>🔹 <b>Enable Two-Factor Authentication (If Available):</b> This adds an extra layer of security.</li>
        <li>🔹 <b>Check Account Activity:</b> Review your recent logins for any suspicious activity.</li>
      </ul>
      <p>For your security, never share your login credentials with anyone. If you need any assistance, feel free to reach out to our support team at <a href="mailto:sharensplit.sn@gmail.com">sharensplit.sn@gmail.com</a>.</p>
      <p>Stay safe and happy sharing! 😊</p>
      <p>Best Regards,</p>
      <p>💙 <b>The ShareNSplit Team</b></p>
    `);

    console.log("✅ Login successful:", user._id);
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Login failed. Server error." });
  }
});



// ✅ Mount Routes
const statsRoutes = require("./routes/stats");
app.use("/api/stats", statsRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected.");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
