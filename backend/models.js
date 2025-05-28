const mongoose = require("./database");

// ✅ User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Evidence Schema
const evidenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileHash: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
});

// ✅ Case Schema (Created only after admin approves a request)
const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "open", "closed"], default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  evidences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Evidence" }],
});

// ✅ Access Request Schema (Users request access to a case)
const accessRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
});

// ✅ Case Creation Request Schema (Requests tracked & linked to created cases)
const caseCreationRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" }, // Stores created case if approved
});

// ✅ Activity Log Schema (Tracks user actions)
const activityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activityType: { type: String, required: true }, // e.g., "CASE_CREATED", "EVIDENCE_UPLOADED"
  relatedId: { type: String, required: true }, // Can refer to Case, Evidence, etc.
  details: String,
  timestamp: { type: Date, default: Date.now },
});

// ✅ Create Models
const User = mongoose.model("User", userSchema);
const Evidence = mongoose.model("Evidence", evidenceSchema);
const Case = mongoose.model("Case", caseSchema);
const AccessRequest = mongoose.model("AccessRequest", accessRequestSchema);
const CaseCreationRequest = mongoose.model("CaseCreationRequest", caseCreationRequestSchema);
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

// ✅ Export All Models
module.exports = {
  User,
  Evidence,
  Case,
  AccessRequest,
  CaseCreationRequest,
  ActivityLog,
};
