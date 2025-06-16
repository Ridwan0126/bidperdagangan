"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FaUsers, FaStore, FaUserCog, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? "bg-blue-700" : ""
  }

  // Navigation items based on user role
  const navItems =
    user?.role === "user"
      ? [{ path: "/data-perpasar", icon: <FaStore />, label: "Data Perpasar" }]
      : [
          { path: "/data-pedagang", icon: <FaStore />, label: "Data Pedagang" },
          { path: "/data-perpasar", icon: <FaUsers />, label: "Data Perpasar" },
          { path: "/user-management", icon: <FaUserCog />, label: "User Management" },
        ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-blue-800 text-white transition-all duration-300 ease-in-out h-full z-20 ${
          isMobile ? "fixed" : "relative"
        } ${isMobile && !sidebarOpen ? "-ml-20" : ""}`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <div className="font-bold text-lg">Diskumperindag</div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-blue-700">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="mt-4">
          <div className="px-4 py-2 text-gray-300 text-sm">
            {sidebarOpen ? (
              <>
                <div>Logged in as:</div>
                <div className="font-bold">{user?.username}</div>
                <div className="text-xs">
                  {user?.role} - {user?.pasar || "All Markets"}
                </div>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          <nav className="mt-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 ${isActive(item.path)} hover:bg-blue-700`}
              >
                <span className="mr-3">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full">
          <button onClick={handleLogout} className={`flex items-center px-4 py-3 w-full hover:bg-blue-700`}>
            <FaSignOutAlt className="mr-3" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-blue-800 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        <div className="font-bold text-lg">Diskumperindag</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-blue-700">
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main content */}
      <div className={`flex-1 overflow-auto ${isMobile ? "pt-16" : ""}`}>{children}</div>
    </div>
  )
}

export default Layout
