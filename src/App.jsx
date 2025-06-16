"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedLayout from "./components/ProtectedLayout"
import SetupData from "./components/SetupData"
import Login from "./pages/Login"
import DataPedagang from "./pages/DataPedagang"
import DataPerpasar from "./pages/DataPerpasar"
import UserManagement from "./pages/UserManagement"
import Unauthorized from "./pages/Unauthorized"
import { useState, useEffect } from "react"

function App() {
  const [setupCompleted, setSetupCompleted] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)

  useEffect(() => {
    // Check if setup was completed before
    const setupStatus = localStorage.getItem("firebase_setup_completed")
    if (setupStatus === "true") {
      setSetupCompleted(true)
    }
    setCheckingSetup(false)
  }, [])

  const handleSetupComplete = () => {
    localStorage.setItem("firebase_setup_completed", "true")
    setSetupCompleted(true)
  }

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!setupCompleted) {
    return <SetupData onComplete={handleSetupComplete} />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/data-perpasar" replace />} />
            <Route path="data-pedagang" element={<DataPedagang />} />
            <Route path="data-perpasar" element={<DataPerpasar />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
