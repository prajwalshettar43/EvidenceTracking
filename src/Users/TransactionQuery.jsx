"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import React from "react"
export default function TransactionQuery() {
  const { caseId } = useParams()
  const [transactionId, setTransactionId] = useState(caseId || "")
  const [transactionData, setTransactionData] = useState(null)
  const [ipfsData, setIpfsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (caseId) {
      fetchTransaction()
    }
  }, [caseId])

  const fetchTransaction = async () => {
    setLoading(true)
    setTransactionData(null)
    setIpfsData(null)
    setError(null)

    try {
      // Fetch transaction details from backend
      const response = await axios.post("http://localhost:5000/query-transaction", { transactionId })
      setTransactionData(response.data)

      // Extract IPFS hash from the response
      const ipfsHash = response.data.hash
      if (ipfsHash) {
        fetchIpfsData(ipfsHash)
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch transaction data.")
    }

    setLoading(false)
  }

  const fetchIpfsData = async (ipfsHash) => {
    try {
      const controller = new AbortController()
      const response = await fetch(`http://127.0.0.1:8080/ipfs/${ipfsHash}`, {
        method: "GET",
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error("Failed to fetch IPFS data.")
      }

      const text = await response.text()

      // In case the IPFS content is JSON, parse it
      const data = JSON.parse(text)
      setIpfsData(data)
    } catch (err) {
      console.error("IPFS fetch error:", err)
      setError("Failed to fetch IPFS data.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Transaction Query</h1>
          <p className="mt-2 text-lg text-gray-600">Enter a transaction ID to retrieve details and evidence</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Search Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
              <button
                onClick={fetchTransaction}
                disabled={loading || !transactionId}
                className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                  loading || !transactionId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Fetching...
                  </span>
                ) : (
                  "Get Transaction"
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {(transactionData || ipfsData) && (
            <div className="divide-y divide-gray-200">
              {/* Transaction Details */}
              {transactionData && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-teal-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Transaction Details
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Hash</span>
                      <span className="text-gray-800 font-mono break-all">{transactionData.hash}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Timestamp</span>
                      <span className="text-gray-800">{transactionData.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* IPFS Data */}
              {ipfsData && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-teal-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Evidence Details
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Evidence ID</span>
                        <span className="text-gray-800">{ipfsData.evidence_id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Case ID</span>
                        <span className="text-gray-800">{ipfsData.case_id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Device Type</span>
                        <span className="text-gray-800">{ipfsData.device_type}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Device Condition</span>
                        <span className="text-gray-800">{ipfsData.device_condition}</span>
                      </div>
                      <div className="flex flex-col col-span-1 md:col-span-2">
                        <span className="text-sm font-medium text-gray-500">Description</span>
                        <span className="text-gray-800">{ipfsData.description}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Collected Date</span>
                        <span className="text-gray-800">{ipfsData.collected_date}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Collected Time</span>
                        <span className="text-gray-800">{ipfsData.collected_time}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Officer ID</span>
                        <span className="text-gray-800">{ipfsData.officer_id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Evidence Type</span>
                        <span className="text-gray-800">{ipfsData.evidence_type}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-500">File Name</span>
                        <span className="text-gray-800">{ipfsData.file_name}</span>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                      <h3 className="text-md font-semibold text-teal-800 mb-2">Location Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-teal-700">Place</span>
                          <span className="text-teal-900">{ipfsData.location.place}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-teal-700">Latitude</span>
                          <span className="text-teal-900">{ipfsData.location.latitude || "N/A"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-teal-700">Longitude</span>
                          <span className="text-teal-900">{ipfsData.location.longitude || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Attachment */}
                    {ipfsData.attachment_hash && (
                      <div className="mt-6">
                        <a
                          href={`http://127.0.0.1:8080/ipfs/${ipfsData.attachment_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
                        >
                          <svg
                            className="mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !transactionData && !ipfsData && !error && (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transaction data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a transaction ID and click "Get Transaction" to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

