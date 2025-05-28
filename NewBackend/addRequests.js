const mongoose = require("mongoose");
const { User, Case, AccessRequest, CaseCreationRequest } = require("./models");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blockchain-evidence";

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const addSampleRequests = async () => {
  try {
    // 🗑️ Delete all existing data before inserting new data
    await AccessRequest.deleteMany({});
    await CaseCreationRequest.deleteMany({});
    console.log("🗑️ Cleared previous AccessRequests and CaseCreationRequests");

    // 1️⃣ Find or create a sample user
    let user = await User.findOne();
    if (!user) {
      user = new User({ username: "test_user", email: "test@example.com", password: "password123" });
      await user.save();
      console.log("✅ Sample User Created:", user._id);
    }

    // 2️⃣ Find or create a sample case
    let caseDoc = await Case.findOne();
    if (!caseDoc) {
      caseDoc = new Case({ title: "Sample CS", description: "This is a test case.", createdBy: user._id });
      await caseDoc.save();
      console.log("✅ Sample Case Created:", caseDoc._id);
    }

    // 3️⃣ Add sample Access Requests
    const accessRequests = [
      { userId: user._id, caseId: caseDoc._id, status: "pending" },
      { userId: user._id, caseId: caseDoc._id, status: "approved" },
    ];
    await AccessRequest.insertMany(accessRequests);
    console.log("✅ Sample Access Requests Added");

    // 4️⃣ Add sample Case Creation Requests
    const caseCreationRequests = [
      { title: "Robbery Case", description: "Request for a new case of robbery.", requestedBy: user._id, status: "pending" },
      { title: "Murder case", description: "Request for Murder case.", requestedBy: user._id, status: "pending" },
    ];
    await CaseCreationRequest.insertMany(caseCreationRequests);
    console.log("✅ Sample Case Creation Requests Added");

  } catch (error) {
    console.error("❌ Error adding sample requests:", error);
  } finally {
    mongoose.connection.close(); // Close connection after execution
  }
};

// Run the function
addSampleRequests();
