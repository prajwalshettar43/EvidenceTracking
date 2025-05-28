import axios from "axios"
// Constants for log types
const LOG_TYPES = {
  NAVIGATION: "NAVIGATION",
  USER_ACTION: "USER_ACTION",
  ERROR: "ERROR",
  SYSTEM: "SYSTEM",
  SECURITY: "SECURITY",
}

// Severity levels
const SEVERITY = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
}

class LoggingServiceClass {
  constructor() {
    // In-memory cache for logs in case network is unavailable
    this.logCache = []
    this.maxCacheSize = 100

    // Flag to track if we're currently sending cached logs
    this.isSendingCache = false

    // Set up interval to flush cache periodically
    setInterval(() => this.flushCache(), 30000) // Every 30 seconds
  }

  /**
   * Log a navigation event
   * @param {string} path - The path navigated to
   * @param {object} user - The current user
   */
  logNavigation(path, user) {
    const logData = {
      type: LOG_TYPES.NAVIGATION,
      severity: SEVERITY.INFO,
      timestamp: new Date().toISOString(),
      userId: user?._id || "anonymous",
      username: user?.username || "anonymous",
      details: `Navigated to: ${path}`,
      metadata: {
        path,
        userRole: user?.role || "anonymous",
      },
    }

    this.sendLog(logData)
  }

  /**
   * Log a user action
   * @param {string} action - The action performed
   * @param {object} user - The current user
   * @param {string} details - Additional details about the action
   * @param {object} metadata - Any additional data to log
   */
  logUserAction(action, user, details, metadata = {}) {
    const logData = {
      type: LOG_TYPES.USER_ACTION,
      severity: SEVERITY.INFO,
      timestamp: new Date().toISOString(),
      userId: user?._id || "anonymous",
      username: user?.username || "anonymous",
      action,
      details,
      metadata: {
        userRole: user?.role || "anonymous",
        ...metadata,
      },
    }

    this.sendLog(logData)
  }

  /**
   * Log an error
   * @param {Error} error - The error object
   * @param {string} context - Where the error occurred
   * @param {object} user - The current user (optional)
   */
  logError(error, context, user = null) {
    const logData = {
      type: LOG_TYPES.ERROR,
      severity: SEVERITY.ERROR,
      timestamp: new Date().toISOString(),
      userId: user?._id || "anonymous",
      username: user?.username || "anonymous",
      details: `Error in ${context}: ${error.message}`,
      metadata: {
        errorName: error.name,
        errorStack: error.stack,
        context,
      },
    }

    this.sendLog(logData)

    // Also log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.error(`[LOG] ${context}:`, error)
    }
  }

  /**
   * Log a security event
   * @param {string} event - The security event
   * @param {object} user - The current user
   * @param {string} details - Additional details
   * @param {string} severity - The severity level
   */
  logSecurityEvent(event, user, details, severity = SEVERITY.WARNING) {
    const logData = {
      type: LOG_TYPES.SECURITY,
      severity,
      timestamp: new Date().toISOString(),
      userId: user?._id || "anonymous",
      username: user?.username || "anonymous",
      action: event,
      details,
      metadata: {
        userRole: user?.role || "anonymous",
        userAgent: navigator.userAgent,
        ipAddress: "client-side", // Will be filled in by server
      },
    }

    this.sendLog(logData)
  }

  /**
   * Send log to server or cache if that fails
   * @param {object} logData - The log data to send
   * @private
   */
  async sendLog(logData) {
    try {
      await axios.post("http://localhost:5000/log-activity", logData)
    } catch (error) {
      // If sending fails, add to cache
      this.addToCache(logData)

      // Log error to console in development
      if (process.env.NODE_ENV !== "production") {
        console.warn("Failed to send log, added to cache:", error)
      }
    }
  }

  /**
   * Add a log to the cache
   * @param {object} logData - The log data to cache
   * @private
   */
  addToCache(logData) {
    // Add to cache
    this.logCache.push(logData)

    // If cache is too large, remove oldest entries
    if (this.logCache.length > this.maxCacheSize) {
      this.logCache = this.logCache.slice(-this.maxCacheSize)
    }
  }

  /**
   * Attempt to send cached logs
   * @private
   */
  async flushCache() {
    // If no logs or already sending, return
    if (this.logCache.length === 0 || this.isSendingCache) {
      return
    }

    this.isSendingCache = true

    try {
      // Create a copy of the cache
      const logsToSend = [...this.logCache]

      // Try to send logs in batches
      await axios.post("http://localhost:5000/log-activity-batch", { logs: logsToSend })

      // If successful, remove sent logs from cache
      this.logCache = this.logCache.slice(logsToSend.length)
    } catch (error) {
      // If sending fails, keep logs in cache
      if (process.env.NODE_ENV !== "production") {
        console.warn("Failed to flush log cache:", error)
      }
    } finally {
      this.isSendingCache = false
    }
  }
}

// Create singleton instance
export const LoggingService = new LoggingServiceClass()