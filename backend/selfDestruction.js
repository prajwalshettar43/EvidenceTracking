const mongoose = require("./database"); // Your existing connection
const { User, Evidence, Case, AccessRequest, CaseCreationRequest, ActivityLog } = require("./models");

const deleteAllData = async () => {
  try {
    await User.deleteMany({});
    await Evidence.deleteMany({});
    await Case.deleteMany({});
    await AccessRequest.deleteMany({});
    await CaseCreationRequest.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log("✅ All collections cleared successfully!");
  } catch (error) {
    console.error("❌ Error deleting data:", error);
  } finally {
    mongoose.connection.close(); // Close only if needed
  }
};

deleteAllData();
