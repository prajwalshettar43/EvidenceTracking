const mongoose = require("./database"); // Import the database connection
const { Evidence } = require("./models"); // Import User model

async function fetchUsers() {
    try {
        const users = await Evidence.find(); // Exclude passwords for security
        console.log("✅ Users Fetched:", users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
    } finally {
        mongoose.connection.close()
            .then(() => console.log("🔌 MongoDB Connection Closed"))
            .catch(err => console.error("❌ Error closing MongoDB:", err));
    }
}

fetchUsers();
