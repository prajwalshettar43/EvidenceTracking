const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
const { CaseCreationRequest , Case,  AccessRequest, User ,Evidence ,ActivityLog} = require("./models"); 
// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// // Connect to MongoDB
// mongoose.connect("mongodb://localhost:27017/myNewDatabase", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
const CHANNEL_NAME = "evidencechannel"; // Fixed channel name

// Helper function to execute shell commands and extract transaction ID
const executeCommand = (cmd, res) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error("Execution Error:", error.message);
            return res.status(500).json({ error: error.message });
        }
        // If stderr exists but contains only harmless messages, ignore it.
        if (stderr && !stderr.includes("Chaincode invoke successful")) {
            console.error("Stderr Output:", stderr.trim());
            return res.status(500).json({ error: stderr.trim() });
        }
        
        // Combine stdout and harmless stderr (if needed)
        const output = stdout.trim() || stderr.trim();
        console.log("Command output:", output);

        // Use regex to extract the transaction ID from the output.
        const match = output.match(/Transaction ID:\s*([a-f0-9]+)/i);
        if (match && match[1]) {
            return res.json({ transactionId: match[1] });
        } else {
            console.error("Transaction ID not found in output:", output);
            return res.status(500).json({ error: "Transaction ID not found" });
        }
    });
};

// API endpoint to query a transaction (POST method)
app.post("/query-transaction", (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
      return res.status(400).json({ error: "Missing transactionId" });
  }

  const command = `peer chaincode query -C ${CHANNEL_NAME} -n qscc -c '{"Args":["GetTransactionByID","${CHANNEL_NAME}","${transactionId}"]}'`;

  exec(command, (error, stdout, stderr) => {
      if (error) {
          return res.status(500).json({ error: `Error executing command: ${error.message}` });
      }
      if (stderr) {
          return res.status(500).json({ error: `stderr: ${stderr}` });
      }

      try {
          const rawData = stdout.toString();

          // Extract hash using regex (IPFS hashes start with "Qm" and are 46 characters long)
          const hashMatch = rawData.match(/Qm[a-zA-Z0-9]{44}/);
          const hash = hashMatch ? hashMatch[0] : "Not found";

          // Extract timestamp using regex (ISO 8601 format)
          const timestampMatch = rawData.match(/"timestamp":"(.*?)"/);
          const timestamp = timestampMatch ? timestampMatch[1] : "Not found";

          res.json({ hash, timestamp });
      } catch (parseError) {
          res.status(500).json({ error: "Error parsing response", details: parseError.message });
      }
  });
});
// Route to add evidence
app.post("/addEvidence", (req, res) => {
    const { newHash } = req.body;
    if (!newHash) {
        return res.status(400).json({ error: "Missing newHash parameter" });
    }

    const cmd = `peer chaincode invoke -o orderer.example.com:7050 \
        --tls true --cafile ${process.env.ORDERER_CA} \
        -C evidencechannel -n evidence_1 \
        --peerAddresses localhost:7051 \
        --tlsRootCertFiles ${process.env.PEER0_ORG1_CA} \
        -c '{"Args":["AddEvidence", "${newHash}"]}'`;
    
    executeCommand(cmd, res);
});


// API Route to Fetch Case Requests
app.get("/case-requests", async (req, res) => {
  try {
    const caseRequests = await CaseCreationRequest.find().populate("requestedBy", "username");
    res.status(200).json(caseRequests);
  } catch (error) {
    console.error("Error fetching case requests:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/approve-case/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;
    console.log(caseId);
    // Find the case request by ID
    const caseRequest = await CaseCreationRequest.findById(caseId);
    if (!caseRequest) {
      return res.status(404).json({ message: "Case request not found" });
    }
    console.log(caseRequest.title);
    // Create a new case from the request
    const newCase = new Case({
      title: caseRequest.title,
      description: caseRequest.description,
      createdBy: caseRequest.requestedBy,
      status: "open",
    });

    await newCase.save();
    console.log(newCase);
    // Update the request status and link the created case
    caseRequest.status = "approved";
    caseRequest.caseId = newCase._id;
    caseRequest.reviewedAt = new Date();
    await caseRequest.save();

    // Grant access to the user by adding them to the AccessRequest table with status "approved"
    const newAccessRequest = new AccessRequest({
      userId: caseRequest.requestedBy,
      caseId: newCase._id,
      status: "approved",
    });

    await newAccessRequest.save();
    await CaseCreationRequest.findByIdAndDelete(caseId);

    res.status(200).json({ message: "Case approved and access granted", case: newCase, access: newAccessRequest });
  } catch (error) {
    console.error("Error approving case:", error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ Fetch cases and check if user has access
app.get("/cases-with-access/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all cases and populate createdBy field
    const cases = await Case.find().populate("createdBy", "username");

    // Fetch access requests for this user
    const accessRequests = await AccessRequest.find({ userId, status: "approved" }).select("caseId");

    // Create a Set of accessible case IDs
    const accessibleCaseIds = new Set(accessRequests.map(req => req.caseId.toString()));

    // Fetch evidence for each case
    const casesWithEvidence = await Promise.all(
      cases.map(async (caseItem) => {
        const evidenceList = await Evidence.find({ caseId: caseItem._id }).select("name");

        return {
          ...caseItem.toObject(),
          accessGranted: accessibleCaseIds.has(caseItem._id.toString()), // true if user has access
          evidence: evidenceList.map((e) => e.name), // Extract only evidence names
        };
      })
    );

    res.status(200).json(casesWithEvidence);
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/request-access", async (req, res) => {
  try {
    const { userId, caseId } = req.body;

    if (!userId || !caseId) {
      return res.status(400).json({ message: "User ID and Case ID are required" });
    }

    // Check if an access request already exists for this user & case
    const existingRequest = await AccessRequest.findOne({ userId, caseId });
    if (existingRequest) {
      return res.status(400).json({ message: "Access request already submitted" });
    }

    // Create new access request
    const newAccessRequest = new AccessRequest({
      userId,
      caseId,
      status: "pending",
    });

    await newAccessRequest.save();

    res.status(201).json({ message: "Access request submitted successfully" });
  } catch (error) {
    console.error("Error requesting access:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/pending-access-requests", async (req, res) => {
  try {
    const requests = await AccessRequest.find({ status: "pending" })
      .populate({
        path: "userId",
        select: "fullName"
      })
      .populate({
        path: "caseId",
        select: "title"
      });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Approve an access request (Update status)
app.put("/approve-access/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await AccessRequest.findByIdAndUpdate(id, { status: "approved" });
    res.json({ message: "Access request approved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Reject an access request (Delete it)
app.delete("/reject-access/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await AccessRequest.findByIdAndDelete(id);
    res.json({ message: "Access request rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/request-case", async (req, res) => {
  try {
    const { title, description, requestedBy } = req.body;

    if (!title || !description || !requestedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRequest = new CaseCreationRequest({
      title,
      description,
      requestedBy,
      status: "pending",
      // caseId is intentionally removed, since it will be added later upon approval
    });

    await newRequest.save();

    res.status(201).json({ message: "Case request submitted successfully", request: newRequest });
  } catch (error) {
    console.error("Error creating case request:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/evidence/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;
    
    // Validate if caseId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({ message: "Invalid case ID format" });
    }
    
    // Fetch all evidence for the given caseId using the correct field names from your schema
    const evidenceList = await Evidence.find({ caseId }).select("title description fileHash uploadedBy uploadedAt");

    if (!evidenceList.length) {
      return res.status(404).json({ message: "No evidence found for this case" });
    }

    res.status(200).json(evidenceList);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    res.status(500).json({ error: error.message });
  }
});

// app.post("/register", async (req, res) => {
//   try {
//     const { username, password, role } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: "Username already taken" });
//     }

//     // Create new user
//     const newUser = new User({ username, password, role: role || "user" });
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully", user: newUser });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // User model
// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   fullName: { type: String, required: true },
//   batchId: { type: String, required: true },
//   department: { type: String, required: true },
//   role: { type: String, default: "pending" }, // default role
// });

// const User = mongoose.model("User", UserSchema);

// Register route
app.post('/register', async (req, res) => {
  const { username, password, email, fullName, batchId, department } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username 
          ? "Username already taken" 
          : "Email already registered" 
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      password, // Note: Not hashing as per your request
      email,
      fullName,
      batchId,
      department,
      role: "pending" // All new registrations start as pending
    });
    
    // Save the user to the database
    await newUser.save();
    
    // Return success response
    return res.status(201).json({ 
      message: "Registration successful. Pending admin approval.",
      user: {
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      message: "Server error during registration. Please try again." 
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // if(user.role="pending"){
    //   return res.status(401).json({message:"Admin has not approved yet!!"});
    // }
    // Generate token
    //const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/add-evidence", async (req, res) => {
  try {
    const { title, description, fileHash, uploadedBy, caseId } = req.body;

    // Validate required fields
    if (!title || !description || !fileHash || !uploadedBy || !caseId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the case exists
    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Create new evidence
    const newEvidence = new Evidence({ title, description, fileHash, uploadedBy, caseId });
    await newEvidence.save();

    // Log the activity
    const logEntry = new ActivityLog({
      userId: uploadedBy,
      activityType: "EVIDENCE_UPLOADED",
      relatedId: newEvidence._id,
      details: `Evidence "${title}" uploaded for case ${caseId}`,
    });
    await logEntry.save();

    res.status(201).json({ message: "Evidence added successfully", evidence: newEvidence });
  } catch (error) {
    console.error("Error adding evidence:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/log-activity", async (req, res) => {
  try {
    const { userId, activityType, relatedId, details } = req.body;

    if (!userId || !activityType) {
      return res.status(400).json({ message: "User ID and activity type are required" });
    }

    const logEntry = new ActivityLog({ userId, activityType, relatedId, details });
    await logEntry.save();

    res.status(201).json({ message: "Activity logged successfully", log: logEntry });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Fetch all activity logs
app.get("/logs", async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate("userId", "username");
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: error.message });
  }
});


//Changes -->>

app.get("/pending-users", async (req, res) => {
  try {
    const pendingUsers = await User.find({ role: "pending" });
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Approve a user (change role from pending to user or admin)
app.put("/approve-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { role: role || "user" },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "User approved successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Reject/delete a user
app.delete("/reject-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User rejected and removed successfully" });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ error: error.message });
  }
});

//changes<<--


// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
