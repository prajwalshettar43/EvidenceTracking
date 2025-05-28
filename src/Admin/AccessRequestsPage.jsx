import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Clock, User, Folder, Calendar } from "lucide-react";

const AccessRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/pending-access-requests");
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching requests:", err.message);
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    try {
      await axios.put(`http://localhost:5000/approve-access/${id}`);
      fetchRequests(); // refresh list
    } catch (err) {
      console.error("Error approving request:", err.message);
    }
  };

  const rejectRequest = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/reject-access/${id}`);
      fetchRequests(); // refresh list
    } catch (err) {
      console.error("Error rejecting request:", err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Access Requests
            </h1>
            <p className="text-slate-500 mt-1">Manage user requests for case access</p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === "all" 
                ? "bg-blue-100 text-blue-700 font-medium" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button 
              onClick={() => fetchRequests()}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-10"
        >
          <div className="p-4 bg-blue-50 rounded-full mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Pending Requests</h2>
          <p className="text-gray-500 text-center max-w-md">
            There are no access requests awaiting your approval at this time. Check back later or refresh the page.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {requests.map((req) => (
            <motion.div
              key={req._id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="bg-amber-50 px-3 py-1 rounded-full text-xs font-medium text-amber-700 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </div>
                </div>
                
                <div className="space-y-3 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {req.userId?.fullName || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <Folder className="w-4 h-4 mr-1" />
                      {req.caseId?.title || "Unknown Case"}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Requested: {new Date(req.requestedAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => approveRequest(req._id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(req._id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-rose-700 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AccessRequestsPage;
