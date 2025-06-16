"use client"

import { useState } from "react"
import {
  setupInitialData,
  createDemoUsers,
  createSampleMarketData,
  checkInitialDataExists,
} from "../utils/setupFirebaseData"

const SetupData = ({ onComplete }) => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState("")
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState("")

  const handleSetup = async () => {
    setLoading(true)
    setError("")

    try {
      // Check if data already exists
      setStep("Checking existing data...")
      const dataExists = await checkInitialDataExists()

      if (dataExists) {
        setStep("Data already exists!")
        setCompleted(true)
        setTimeout(() => onComplete(), 2000)
        return
      }

      setStep("Setting up markets, units, and commodities...")
      await setupInitialData()

      setStep("Creating demo user accounts...")
      await createDemoUsers()

      setStep("Creating sample market data...")
      await createSampleMarketData()

      setStep("Setup completed successfully!")
      setCompleted(true)

      setTimeout(() => {
        onComplete()
      }, 3000)
    } catch (error) {
      console.error("Setup error:", error)
      setError(`Setup failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4">Setup Completed!</h2>
          <p className="mb-4">Demo accounts created:</p>
          <div className="text-left bg-gray-100 p-4 rounded text-sm">
            <div className="mb-3">
              <p className="font-bold text-purple-600">Admin Account:</p>
              <p>Email: admin@diskumperindag.com</p>
              <p>Password: admin123</p>
            </div>
            <div className="mb-3">
              <p className="font-bold text-blue-600">User Accounts:</p>
              <p>sumowono@diskumperindag.com / user123</p>
              <p>bandarjo@diskumperindag.com / user123</p>
              <p>projo@diskumperindag.com / user123</p>
              <p>ambarawa@diskumperindag.com / user123</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Firebase Setup Required</h2>
        <p className="mb-6">Click the button below to set up initial data and create demo accounts for testing.</p>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {loading && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">{step}</p>
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 w-full"
        >
          {loading ? "Setting up..." : "Setup Firebase Data"}
        </button>

        {!loading && (
          <div className="mt-4 text-xs text-gray-500">
            <p>This will create:</p>
            <ul className="list-disc list-inside text-left">
              <li>Markets, Units, Commodities</li>
              <li>Demo user accounts</li>
              <li>Sample market data</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default SetupData
