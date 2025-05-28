const mongoose = require("mongoose");
const { Case, User, Evidence } = require("./models"); // Import models
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blockchain-evidence";

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const addSampleCase = async () => {
  try {
    // 1️⃣ Find an existing user (or create a dummy user)
    let user = await User.findOne();
    if (!user) {
      user = new User({ username: "test_user", email: "test@example.com", password: "password123" });
      await user.save();
      console.log("✅ Sample User Created:", user._id);
    }

    // 2️⃣ Find existing evidence (or create a dummy evidence)
    

    // 3️⃣ Create a new case
    const newCase = new Case({
      title: "Sample Case",
      description: "This is a test case for testing purposes.",
      status: "pending",
      createdBy: user._id, // Reference to the existing user
      evidences: [], // Reference to evidence
    });

    await newCase.save();
    console.log("✅ Sample Case Created:", newCase);

  } catch (error) {
    console.error("❌ Error adding sample case:", error);
  } finally {
    mongoose.connection.close(); // Close connection after execution
  }
};

// Run the function
addSampleCase();
