const mongoose = require("mongoose");
const { Evidence } = require("./models"); // Import the Evidence model

async function updateAllFileHashes() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/final"); // Connect to your DB

    const result = await Evidence.updateMany({}, {
      $set: {
        fileHash: 'e93c263d2dd03789c61a6c9f91b4ecef02a03a26cb3c8cd4b65646b9711070be'
      }
    });

    console.log(`Updated ${result.modifiedCount} document(s).`);
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

updateAllFileHashes();
