"use client"

import { useState, useRef } from "react"
import React from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileText, 
  User, 
  MessageSquare, 
  Upload, 
  FileIcon, 
  XCircle, 
  Tag,
  LucideTag,
  Briefcase
} from "lucide-react"
import { useAuth } from "../components/AuthContext"

export default function SubmitCaseRequest({ userId }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState("idle")
  const [focusedField, setFocusedField] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const fileInputRef = useRef(null)

  const { currentUser } = useAuth()

  const handleTagAdd = () => {
    if (newTag && !tags.includes(newTag) && tags.length < 5) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length + files.length > 5) {
      setMessage("❗ Maximum 5 files allowed")
      setStatus("error")
      return
    }
    setFiles([...files, ...selectedFiles])
  }

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus("idle")

    if (!title || !description || !currentUser?._id) {
      setMessage("❗ Please fill all required fields")
      setStatus("error")
      setIsSubmitting(false)
      return
    }

    try {
      // In a real app, you would use FormData to handle file uploads
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("requestedBy", currentUser?._id)
      formData.append("category", category)
      
      // Add tags
      tags.forEach((tag, index) => {
        formData.append(`tag-${index}`, tag)
      })

      // Add files
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

      // For demonstration, we'll use the existing API endpoint
      // In a real app, you would handle file uploads and additional fields
      const res = await axios.post("http://localhost:5000/request-case", {
        title,
        description,
        requestedBy: currentUser?._id,
        // Additional fields would be sent in a real implementation
      })

      setMessage("✅ Case request submitted successfully!")
      setStatus("success")
      
      // Reset form
      setTitle("")
      setDescription("")
      setCategory("")
      setTags([])
      setFiles([])
      setCurrentStep(1)
    } catch (err) {
      console.error("Error submitting case:", err)
      setMessage("❌ Failed to submit case request.")
      setStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && (!title || !description)) {
      setMessage("❗ Please fill all required fields in this step")
      setStatus("error")
      return
    }
    setCurrentStep(currentStep + 1)
    setMessage("")
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    setMessage("")
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  const categories = [
    "Cybercrime",
    "Fraud Investigation",
    "Intellectual Property",
    "Digital Forensics",
    "Security Breach",
    "Other"
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-bl-full -z-10 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-100 to-rose-100 dark:from-amber-900/20 dark:to-rose-900/20 rounded-tr-full -z-10 opacity-70"></div>

        {/* Progress Steps */}
        <div className="pt-8 px-8">
          <div className="flex justify-between relative mb-8">
            {[1, 2, 3].map(step => (
              <div 
                key={step} 
                className="z-10 flex flex-col items-center"
                onClick={() => step < currentStep && setCurrentStep(step)}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: currentStep >= step ? 1 : 0.8,
                    backgroundColor: currentStep > step 
                      ? "#4F46E5" 
                      : currentStep === step 
                        ? "#818CF8" 
                        : "#E2E8F0"
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                    ${currentStep > step ? "bg-indigo-600" : currentStep === step ? "bg-indigo-400" : "bg-slate-200"}
                  `}
                >
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-medium">{step}</span>
                  )}
                </motion.div>
                <span className={`mt-2 text-sm ${currentStep >= step ? "text-indigo-600 font-medium" : "text-slate-400"}`}>
                  {step === 1 ? "Basic Info" : step === 2 ? "Details" : "Review"}
                </span>
              </div>
            ))}
            
            {/* Progress bar */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 -z-0">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ 
                  width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" 
                }}
                className="h-full bg-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-8 pb-0">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-1"
          >
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl shadow-sm">
              <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
              Create New Case Request
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 ml-14 mb-6"
          >
            {currentStep === 1 ? "Provide essential case information" : 
             currentStep === 2 ? "Add additional details and attachments" :
             "Review your case details before submission"}
          </motion.p>
        </div>

        {/* Form */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                variants={formVariants}
                className="space-y-5"
              >
                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md transition-colors duration-300 ${focusedField === "title" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"}`}
                    >
                      <FileText
                        className={`w-4 h-4 transition-colors duration-300 ${focusedField === "title" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                      />
                    </div>
                    <label htmlFor="title" className="font-medium">
                      Case Title <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onFocus={() => setFocusedField("title")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-4 pr-4 py-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                      placeholder="Enter case title"
                    />
                    <AnimatePresence>
                      {focusedField === "title" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 pointer-events-none border-2 border-blue-500 dark:border-blue-400 rounded-xl"
                        ></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md transition-colors duration-300 ${focusedField === "description" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"}`}
                    >
                      <MessageSquare
                        className={`w-4 h-4 transition-colors duration-300 ${focusedField === "description" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                      />
                    </div>
                    <label htmlFor="description" className="font-medium">
                      Description <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => setFocusedField("description")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full min-h-[180px] pl-4 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 resize-y"
                      placeholder="Describe your case in detail"
                    ></textarea>
                    <AnimatePresence>
                      {focusedField === "description" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="absolute inset-0 pointer-events-none border-2 border-blue-500 dark:border-blue-400 rounded-xl"
                        ></motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    </div>
                    <label htmlFor="userId" className="font-medium">
                      Requested By
                    </label>
                  </div>
                  <input
                    id="userId"
                    value={currentUser._id}
                    disabled
                    className="w-full pl-4 pr-4 py-3 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700"
                  />
                </motion.div>
              </motion.form>
            )}

            {currentStep === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md transition-colors duration-300 ${focusedField === "category" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"}`}
                    >
                      <Briefcase
                        className={`w-4 h-4 transition-colors duration-300 ${focusedField === "category" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                      />
                    </div>
                    <label htmlFor="category" className="font-medium">
                      Case Category
                    </label>
                  </div>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onFocus={() => setFocusedField("category")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-4 pr-4 py-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md transition-colors duration-300 ${focusedField === "tags" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"}`}
                    >
                      <LucideTag
                        className={`w-4 h-4 transition-colors duration-300 ${focusedField === "tags" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                      />
                    </div>
                    <label htmlFor="tags" className="font-medium">
                      Tags <span className="text-xs text-slate-400">(max 5)</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        <span>{tag}</span>
                        <button type="button" onClick={() => handleTagRemove(tag)} className="text-blue-400 hover:text-blue-600">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="tags"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onFocus={() => setFocusedField("tags")}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleTagAdd())}
                      className="flex-1 pl-4 pr-4 py-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                      placeholder="Add a tag"
                      disabled={tags.length >= 5}
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      disabled={!newTag || tags.length >= 5}
                      className="px-4 h-12 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-md transition-colors duration-300 ${focusedField === "files" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"}`}
                    >
                      <Upload
                        className={`w-4 h-4 transition-colors duration-300 ${focusedField === "files" ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
                      />
                    </div>
                    <label htmlFor="files" className="font-medium">
                      Attachments <span className="text-xs text-slate-400">(max 5)</span>
                    </label>
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors hover:border-blue-300 dark:hover:border-blue-600">
                    <input
                      type="file"
                      id="files"
                      ref={fileInputRef}
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      disabled={files.length >= 5}
                    />
                    <div 
                      onClick={() => files.length < 5 && fileInputRef.current.click()}
                      className="flex flex-col items-center justify-center py-4 cursor-pointer"
                    >
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3">
                        <Upload className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-center text-slate-600 dark:text-slate-400 mb-1">
                        {files.length >= 5 ? (
                          <span className="text-amber-600">Maximum files reached</span>
                        ) : (
                          <>
                            <span className="font-medium text-blue-500">Click to upload</span> or drag and drop
                          </>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        PDF, DOCX, JPG, PNG (max 5MB each)
                      </p>
                    </div>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-md">
                              <FileIcon className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFile(file)}
                            className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.form>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800/20"
                >
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">Case Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Title</p>
                      <p className="font-medium">{title}</p>
                    </div>
                    
                    {category && (
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Category</p>
                        <p className="font-medium">{category}</p>
                      </div>
                    )}
                    
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Description</p>
                      <p className="text-sm">{description}</p>
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <div key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {files.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Attachments</p>
                        <div className="flex flex-wrap gap-2">
                          {files.map((file, index) => (
                            <div key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 rounded-full text-sm flex items-center gap-1">
                              <FileIcon className="w-3 h-3" />
                              <span>{file.name.length > 15 ? `${file.name.slice(0, 12)}...` : file.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/10 rounded-r-lg"
                >
                  <p className="text-amber-700 dark:text-amber-400">
                    Please review your case details carefully before submitting. Once submitted, a case administrator will review your request.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                currentStep === 1
                  ? "opacity-0 pointer-events-none"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all flex items-center gap-2"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>Submit Case</>
                )}
              </button>
            )}
          </div>

          {/* Status message */}
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={message}
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-5 overflow-hidden"
              >
                <motion.div
                  initial={{ x: status === "success" ? -20 : 20 }}
                  animate={{ x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    status === "success"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30"
                      : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-100 dark:border-red-800/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      status === "success" ? "bg-green-100 dark:bg-green-800/30" : "bg-red-100 dark:bg-red-800/30"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      status === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {message}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}