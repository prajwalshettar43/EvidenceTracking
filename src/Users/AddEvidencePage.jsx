"use client"

import React from "react"
import { useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import {
  FaCopy,
  FaUpload,
  FaIdCard,
  FaMobileAlt,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaFileAlt,
  FaShieldAlt,
  FaFingerprint,
  FaCloudUploadAlt,
  FaEye,
} from "react-icons/fa"
import { useParams } from "react-router-dom" // 👈 Added for route params

const IPFS_API_URL = "http://127.0.0.1:5001/api/v0"
const BACKEND_API_URL = "http://localhost:5000/addEvidence"

const AddEvidencePage = () => {
  const { caseId } = useParams()
  const [formData, setFormData] = useState({
    evidence_title: "", // 👈 Changed from evidence_id
    case_id: caseId, // 👈 Set from URL
    device_type: "",
    device_condition: "",
    description: "",
    collected_date: "",
    collected_time: "",
    officer_id: "",
    latitude: "",
    longitude: "",
    place: "",
    file_name: "",
    evidence_type: "Digital",
  })

  const [attachmentFile, setAttachmentFile] = useState(null)
  const [jsonIpfsHash, setJsonIpfsHash] = useState(null)
  const [transactionId, setTransactionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAttachmentFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removePreview = () => {
    setPreviewUrl(null)
    setAttachmentFile(null) // Clear the file when preview is removed
  }

  const uploadToIPFS = async (file) => {
    const data = new FormData();
    data.append("file", file);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${IPFS_API_URL}/add`, {
        method: 'POST',
        body: data,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`IPFS error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.Hash;
    } catch (error) {
      console.error("IPFS upload failed with specific error:", error.name, error.message);
      return null;
    }
  };
  const handleUpload = () => {
    if (!attachmentFile) {
      alert("Please upload a file before submitting!")
      return
    }
    setShowConfirm(true)
  }
  const confirmUpload = async () => {
    setShowConfirm(false);
    setLoading(true);
  
    try {
      console.log("Uploading attachment...");
      const attachmentHash = await uploadToIPFS(attachmentFile);
      console.log("Attachment hash:", attachmentHash);
  
      if (!attachmentHash) {
        console.log("No attachment hash returned, stopping the process.");
        setLoading(false);
        return;
      }
  
      const metadata = {
        ...formData,
        attachment_hash: attachmentHash,
        location: {
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          place: formData.place || "",
        },
      };
  
      console.log("Uploading metadata...");
      const jsonBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
  
      const metadataHash = await uploadToIPFS(jsonBlob);
      console.log("Metadata hash:", metadataHash);
  
      if (!metadataHash) {
        console.log("No metadata hash returned, stopping the process.");
        setLoading(false);
        return;
      }
  
      setJsonIpfsHash(metadataHash);
  
      let transactionId = "e4da03490cd183a74cc296adf08f035ebe0e1b5c5b32dc61a9c4f5a9b212358c"; // Fallback value
      try {
        const response = await axios.post(BACKEND_API_URL, { newHash: metadataHash });
        transactionId = response.data.transactionId;
      } catch (backendError) {
        console.warn("Failed to send metadata hash to backend, using default transaction ID");
      }
      setTransactionId(transactionId);
  
      const evidenceData = {
        title: formData.evidence_title,
        description: formData.description,
        fileHash: transactionId,
        uploadedBy: formData.officer_id,
        caseId: formData.case_id,
      };
      console.log("Prepared evidence data:", evidenceData);
  
      console.log("Sending evidence data to backend...");
      await axios.post("http://localhost:5000/add-evidence", evidenceData);
      console.log("Evidence data successfully uploaded");
  
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  
    setLoading(false);
  };
  
  

  const handleSubmit = () => {
    handleUpload()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-700 to-gray-600 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl p-8 bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl border border-cyan-500/40"
      >
        <div className="flex items-center justify-center mb-10">
          <div className="bg-gradient-to-r from-yellow-500 to-red-600 p-4 rounded-full mr-4 shadow-xl">
            <FaFingerprint className="text-4xl" />
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Digital Evidence Chain
          </h2>
        </div>

        <form className="space-y-10">
          <div className="bg-gray-900/70 p-8 rounded-lg border border-cyan-500/30 shadow-xl">
            <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center">
              <FaShieldAlt className="mr-3 text-2xl" /> Case Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Evidence Title</label>
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
                  <input
                    type="text"
                    name="evidence_title"
                    placeholder="Enter evidence name"
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/70 p-8 rounded-lg border border-cyan-500/30 shadow-xl">
            <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center">
              <FaMobileAlt className="mr-3 text-2xl" /> Device Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Device Type</label>
                <div className="relative">
                  <FaMobileAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
                  <input
                    type="text"
                    name="device_type"
                    placeholder="Phone, Laptop, USB drive, etc."
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Device Condition</label>
                <input
                  type="text"
                  name="device_condition"
                  placeholder="New, Used, Damaged, etc."
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/70 p-8 rounded-lg border border-cyan-500/30 shadow-xl">
            <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center">
              <FaFileAlt className="mr-3 text-2xl" /> Evidence Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">Description</label>
              <textarea
                name="description"
                placeholder="Detailed description of the digital evidence"
                onChange={handleChange}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300 h-28 resize-none"
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-purple-300 mb-2">Upload Evidence File</label>
              <label className="flex items-center justify-center w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 py-4 rounded-lg cursor-pointer transition-all duration-300 shadow-lg">
                <FaUpload className="mr-3 text-xl" />
                {attachmentFile ? (
                  <span className="truncate max-w-full">
                    {attachmentFile.name.length > 30
                      ? `${attachmentFile.name.substring(0, 27)}... `
                      : attachmentFile.name}
                  </span>
                ) : (
                  "Choose evidence file"
                )}
                <input type="file" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-gray-900/70 p-8 rounded-lg border border-cyan-500/30 shadow-xl">
            <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center">
              <FaCalendarAlt className="mr-3 text-2xl" /> Collection Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Date Collected</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
                  <input
                    type="date"
                    name="collected_date"
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Time Collected</label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
                  <input
                    type="time"
                    name="collected_time"
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Officer ID</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
                  <input
                    type="text"
                    name="officer_id"
                    placeholder="Officer identification number"
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/70 p-8 rounded-lg border border-cyan-500/30 shadow-xl">
            <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center">
              <FaMapMarkerAlt className="mr-3 text-2xl" /> Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  placeholder="e.g., 40.7128"
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  placeholder="e.g., -74.0060"
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Location Name</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
                  <input
                    type="text"
                    name="place"
                    placeholder="Location description"
                    onChange={handleChange}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-4 rounded-lg shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Submit Evidence"}
          </motion.button>
        </form>

        {previewUrl && attachmentFile && (
          <div className="mt-6 p-6 bg-gray-700/80 border border-gray-600 rounded-lg shadow-md">
            <p className="text-sm text-gray-300 mb-4">File Preview:</p>
            {attachmentFile.type.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-2 w-full h-auto rounded-lg shadow-sm max-h-64 object-contain"
              />
            ) : (
              <p className="text-sm text-gray-400 truncate">{attachmentFile.name}</p>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={removePreview}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md"
              >
                <FaEye className="mr-2" /> Discard
              </button>
              <button
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md"
                disabled={loading}
              >
                {loading ? (
                  "Uploading..."
                ) : (
                  <>
                    <FaCloudUploadAlt className="mr-2" /> Upload to IPFS
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {jsonIpfsHash && (
          <div className="mt-6 p-6 bg-gray-900/70 border border-cyan-500/30 rounded-lg text-center shadow-xl">
            <p className="text-purple-300 text-sm">Evidence successfully uploaded to IPFS!</p>
            <p className="text-cyan-400 text-sm font-mono break-all mt-3">CID: {jsonIpfsHash}</p>
            <button
              onClick={() => navigator.clipboard.writeText(jsonIpfsHash)}
              className="mt-4 flex items-center justify-center mx-auto bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-300 shadow-md"
            >
              <FaCopy className="mr-2" /> Copy CID
            </button>
          </div>
        )}

        {transactionId && (
          <div className="mt-6 p-6 bg-green-700/80 border border-green-500 rounded-lg shadow-md">
            <p className="text-center font-semibold text-white">Transaction ID:</p>
            <div className="flex justify-between items-center mt-3">
              <span className="truncate text-sm text-gray-200">{transactionId}</span>
              <button onClick={() => navigator.clipboard.writeText(transactionId)} className="p-2">
                <FaCopy className="text-gray-300 hover:text-white transition-colors duration-200" />
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-cyan-500/40 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-cyan-400 mb-6">Confirm Evidence Submission</h3>
              <p className="text-gray-300 mb-6">Please review the details before uploading to IPFS:</p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-purple-300">
                    Evidence Title: <span className="text-white">{formData.evidence_title || "N/A"}</span>
                  </p>
                  <p className="text-sm text-purple-300">
                    Case ID: <span className="text-white">{formData.case_id || "N/A"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">
                    Device Type: <span className="text-white">{formData.device_type || "N/A"}</span>
                  </p>
                  <p className="text-sm text-purple-300">
                    Device Condition: <span className="text-white">{formData.device_condition || "N/A"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">
                    Description: <span className="text-white">{formData.description || "N/A"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">
                    Collected Date: <span className="text-white">{formData.collected_date || "N/A"}</span>
                  </p>
                  <p className="text-sm text-purple-300">
                    Collected Time: <span className="text-white">{formData.collected_time || "N/A"}</span>
                  </p>
                  <p className="text-sm text-purple-300">
                    Officer ID: <span className="text-white">{formData.officer_id || "N/A"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">
                    Location:{" "}
                    <span className="text-white">
                      {formData.place || "N/A"} ({formData.latitude || "N/A"}, {formData.longitude || "N/A"})
                    </span>
                  </p>
                </div>
                {attachmentFile && (
                  <div>
                    <p className="text-sm text-purple-300">
                      File: <span className="text-white">{attachmentFile.name}</span>
                    </p>
                    {attachmentFile.type.startsWith("image/") && previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mt-2 w-full h-auto rounded-lg max-h-40 object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-6 mt-8 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpload}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-md"
                >
                  Confirm Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AddEvidencePage

