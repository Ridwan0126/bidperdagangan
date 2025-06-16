"use client"

import { useEffect } from "react"
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Layout from "./Layout"

const ProtectedLayout = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check role-based permissions
    if (user && !loading) {
      console.log("Current user:", user)
      console.log("Current path:", location.pathname)

      // Admin can access everything
      if (user.role === "admin") {
        return
      }

      // User role restrictions
      if (user.role === "user") {
        // Users can only access data-perpasar
        if (location.pathname.startsWith("/data-pedagang") || location.pathname.startsWith("/user-management")) {
          console.log("User trying to access restricted area, redirecting to unauthorized")
          navigate("/unauthorized")
        }
      }
    }
  }, [user, loading, location.pathname, navigate])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Render the layout with the outlet for nested routes
  return (
    <Layout>
      <div className="w-full h-full p-4">
        <Outlet />
      </div>
    </Layout>
  )
}

export default ProtectedLayout
