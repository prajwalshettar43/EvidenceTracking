const mongoose = require("./database"); // Database connection
const { AccessRequest, CaseCreationRequest } = require("./models");

async function fetchRequests() {
  try {
    // Fetch all access requests with user and case details populated
    const accessRequests = await AccessRequest.find()
      .populate("userId", "username") // Populate User data (only username)
      .populate("caseId", "title"); // Populate Case data (only title)

    console.log("✅ Access Requests Fetched:", accessRequests);

    // Fetch all case creation requests with user details populated
    const caseRequests = await CaseCreationRequest.find()
      .populate("requestedBy", "username"); // Populate User data (only username)

    console.log("✅ Case Creation Requests Fetched:", caseRequests);

  } catch (error) {
    console.error("❌ Error fetching requests:", error);
  } finally {
    mongoose.connection.close()
      .then(() => console.log("🔌 MongoDB Connection Closed"))
      .catch(err => console.error("❌ Error closing MongoDB:", err));
  }
}

fetchRequests();
