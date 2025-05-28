const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Import models
const { Admin } = require("./models");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// API Route to Add an Admin
app.post("/add-admin", async (req, res) => {
    try {
        const { admin_id, name, password } = req.body;
        const admin = new Admin({ admin_id, name, password, created_at: new Date(), last_login: new Date() });
        await admin.save();
        res.status(201).json({ message: "Admin added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
