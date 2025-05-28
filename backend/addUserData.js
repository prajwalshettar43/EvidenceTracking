const mongoose = require("./database"); // Ensure this contains the correct DB connection
const { User, CaseCreationRequest } = require("./models");

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await CaseCreationRequest.deleteMany({});

    console.log("✅ Previous data cleared.");

    // Insert Multiple Users
    const users = await User.insertMany([
      { username: "adminUser", password: "securepassword", role: "admin" },
      { username: "johnDoe", password: "userpassword1", role: "user" },
      { username: "janeDoe", password: "userpassword2", role: "user" },
    ]);

    console.log("✅ Users added:", users);

    // Find a non-admin user to request case creation
    const requestingUser = users.find(user => user.role === "user");

    // Insert a Case Creation Request by a regular user
    const caseRequests = await CaseCreationRequest.insertMany([
      {
        title: "Cybercrime Investigation",
        description: "Investigating a phishing attack.",
        requestedBy: requestingUser._id,
        status: "pending",
      },
      {
        title: "Intellectual Property Theft",
        description: "A company reported stolen trade secrets.",
        requestedBy: requestingUser._id,
        status: "pending",
      },
    ]);

    console.log("✅ Case Creation Requests added:", caseRequests);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    mongoose.connection.close(); // Close connection after completion
  }
};

// Run the script
seedData();
