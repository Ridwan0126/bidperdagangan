"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import { getAllUsers, createUser, updateUser, deleteUser } from "../services/authService"
import { getMarkets } from "../services/marketService"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [markets, setMarkets] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    pasar: "",
  })
  const [formErrors, setFormErrors] = useState({})

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, marketsData] = await Promise.all([getAllUsers(), getMarkets()])
      setUsers(usersData)
      setFilteredUsers(usersData)
      setMarkets(marketsData)
    } catch (error) {
      console.error("Error loading data:", error)
      alert("Error loading data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username.toLowerCase().includes(term.toLowerCase()) ||
            (user.pasar && user.pasar.toLowerCase().includes(term.toLowerCase())),
        ),
      )
    }
  }

  // Open modal for adding new user
  const handleAddUser = () => {
    setCurrentUser(null)
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      pasar: "",
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Open modal for editing user
  const handleEditUser = (user) => {
    setCurrentUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      pasar: user.pasar || "",
    })
    setFormErrors({})
    setShowModal(true)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!formData.username.trim()) {
      errors.username = "Username is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    }

    if (!currentUser) {
      // Only validate password for new users
      if (!formData.password) {
        errors.password = "Password is required"
      } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters"
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match"
      }
    }

    if (formData.role === "user" && !formData.pasar) {
      errors.pasar = "Market is required for user role"
    }

    return errors
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)

    try {
      if (currentUser) {
        // Update existing user
        await updateUser(currentUser.id, {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          pasar: formData.role === "admin" ? null : formData.pasar,
        })
      } else {
        // Add new user
        await createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          pasar: formData.role === "admin" ? null : formData.pasar,
        })
      }

      // Reload data
      await loadData()
      setShowModal(false)
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Error saving user: " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Confirm delete user
  const confirmDeleteUser = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  // Delete user
  const handleDeleteUser = async () => {
    try {
      await deleteUser(userToDelete.id)
      await loadData()
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={handleAddUser}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="border rounded-lg py-2 px-4 pl-10 w-64"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Username</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Role</th>
                <th className="py-2 px-4 border">Market</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{user.username}</td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  <td className="py-2 px-4 border">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">{user.pasar || "-"}</td>
                  <td className="py-2 px-4 border">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => confirmDeleteUser(user)}
                        className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{currentUser ? "Edit User" : "Add New User"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.username ? "border-red-500" : ""
                  }`}
                  disabled={submitting}
                />
                {formErrors.username && <p className="text-red-500 text-xs italic">{formErrors.username}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  disabled={submitting}
                />
                {formErrors.email && <p className="text-red-500 text-xs italic">{formErrors.email}</p>}
              </div>

              {!currentUser && (
                <>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        formErrors.password ? "border-red-500" : ""
                      }`}
                      disabled={submitting}
                    />
                    {formErrors.password && <p className="text-red-500 text-xs italic">{formErrors.password}</p>}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        formErrors.confirmPassword ? "border-red-500" : ""
                      }`}
                      disabled={submitting}
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs italic">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}

              <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled={submitting}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              {formData.role === "user" && (
                <div className="mb-4">
                  <label htmlFor="pasar" className="block text-gray-700 text-sm font-bold mb-2">
                    Market
                  </label>
                  <select
                    id="pasar"
                    name="pasar"
                    value={formData.pasar}
                    onChange={handleInputChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      formErrors.pasar ? "border-red-500" : ""
                    }`}
                    disabled={submitting}
                  >
                    <option value="">Select Market</option>
                    {markets.map((market) => (
                      <option key={market.id} value={market.name}>
                        {market.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.pasar && <p className="text-red-500 text-xs italic">{formErrors.pasar}</p>}
                </div>
              )}

              <div className="flex justify-end mt-6 gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : currentUser ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>
              Are you sure you want to delete user <strong>{userToDelete?.username}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
